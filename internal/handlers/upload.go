package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/markbates/goth/gothic"
)

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	const uploadLimit = 32 << 20 // 32MB
	err := r.ParseMultipartForm(uploadLimit)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "File parsing error", err)
	}
	files := r.MultipartForm.File["file"]
	var userSongData []parser.UserSongData

	for _, fileheader := range files {
		file, err := fileheader.Open()
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "Failed to read form file", err)
			return
		}
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(fileheader.Filename))

		switch ext {
		case ".json":
			outPath := filepath.Join("tmp", fileheader.Filename)

			if err := os.MkdirAll("tmp", os.ModePerm); err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create tmp dir", err)
				return
			}

			outFile, err := os.Create(outPath)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save JSON file", err)
				return
			}
			defer outFile.Close()

			if _, err := io.Copy(outFile, file); err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to write JSON file", err)
				return
			}

			parsedData, err := parser.ParseJsonFiles([]string{outPath})
			if err != nil {
				fmt.Printf("Bad file upload at %s", outPath)
				continue
			}

			userSongData = append(userSongData, parsedData...)

			os.Remove(outPath)

			file.Close()
		case ".zip":
			paths, err := parser.UnzipAndExtractFiles(file, "tmp")
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to extract zip", err)
				return
			}

			parsedData, err := parser.ParseJsonFiles(paths)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "unable to parse json files", err)
			}

			userSongData = append(userSongData, parsedData...)

			for _, path := range paths {
				os.Remove(path)
			}

			file.Close()

		default:
			file.Close()
			continue
		}
	}

	dbUser, err := storeDataInDB(r, userSongData)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "unable to store user data in database", err)
	}

	utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{
		"message": "Uploaded files processed succesfully",
		"user":    dbUser.SpotifyID,
		"data":    dbUser.Data,
	})

}

func storeDataInDB(r *http.Request, data []parser.UserSongData) (database.User, error) {
	ctx := r.Context()

	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		log.Printf("[storeDataInDB] Session error: %v", err)
		return database.User{}, err
	}

	spotifyID, ok := sess.Values["user_id"].(string)
	if !ok || spotifyID == "" {
		log.Printf("[storeDataInDB] No valid user_id in session! Values: %+v", sess.Values)
		return database.User{}, errors.New("no user ID in session")
	}

	blob, err := json.Marshal(data)
	if err != nil {
		return database.User{}, err
	}
	blobText := string(blob)

	existing, err := utils.Cfg.DB.GetUserData(ctx, spotifyID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			newID := uuid.New().String()
			newUser, err := utils.Cfg.DB.CreateUser(ctx, database.CreateUserParams{
				ID:        newID,
				SpotifyID: spotifyID,
				Data:      blobText,
			})
			if err != nil {
				return database.User{}, fmt.Errorf("error creating new user: %w", err)
			}
			return newUser, nil
		}
		return database.User{}, fmt.Errorf("error checking for existing user: %w", err)
	}

	updatedUser, err := utils.Cfg.DB.UpdateUser(ctx, database.UpdateUserParams{
		ID:   existing.ID,
		Data: blobText,
	})
	if err != nil {
		return database.User{}, fmt.Errorf("error updating user: %w", err)
	}

	return updatedUser, nil
}

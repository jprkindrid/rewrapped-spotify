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
	"github.com/kindiregg/spotify-data-analyzer/internal/database"
	"github.com/kindiregg/spotify-data-analyzer/internal/parser"
	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
	"github.com/markbates/goth/gothic"
)

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	const uploadLimit = 32 << 20 // 32MB
	r.ParseMultipartForm(uploadLimit)

	file, header, err := r.FormFile("file")
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Failed to read form file", err)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))

	switch ext {
	case ".json":
		outPath := filepath.Join("tmp", header.Filename)

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

		paths := make([]string, 1)
		paths = append(paths, outPath)
		parsedData, err := parser.ParseJsonFiles(paths)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "unable to parse json file", err)
		}

		dbUser, err := storeDataInDB(r, parsedData)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "unable to store user data in database", err)
		}

		os.Remove(outPath)

		utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{
			"message": "JSON file processed succesfully",
			"path":    outPath,
			"user":    dbUser.SpotifyID,
			"data":    dbUser.Data,
		})

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

		dbUser, err := storeDataInDB(r, parsedData)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "unable to store user data in database", err)
		}

		for _, path := range paths {
			os.Remove(path)
		}

		utils.RespondWithJSON(w, http.StatusAccepted, map[string]any{
			"message": "ZIP processed successfully",
			"files":   paths,
			"user":    dbUser.SpotifyID,
			"data":    dbUser.Data,
		})

	default:
		utils.RespondWithError(w, http.StatusBadRequest, "Only .json and .zip files are supported", nil)
	}

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

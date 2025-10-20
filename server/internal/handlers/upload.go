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
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func (cfg *ApiConfig) HandlerUpload(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(constants.MaxFileUploadSize)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "File parsing error", err)
		return
	}
	files := r.MultipartForm.File[constants.FileFormHeader]
	var userSongData []parser.MinifiedSongData

	for _, fileheader := range files {
		ext := strings.ToLower(filepath.Ext(fileheader.Filename))

		switch ext {
		case ".json":
			file, err := fileheader.Open()
			if err != nil {
				utils.RespondWithError(w, http.StatusBadRequest, "Failed to read form file", err)
				return
			}
			outPath := filepath.Join(constants.TempDirName, fileheader.Filename)

			if err := os.MkdirAll(constants.TempDirName, os.ModePerm); err != nil {
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

			minifiedData := parser.MinifyParsedData(parsedData)

			userSongData = append(userSongData, minifiedData...)

			os.Remove(outPath)

			file.Close()
		case ".zip":
			file, err := fileheader.Open()
			if err != nil {
				utils.RespondWithError(w, http.StatusBadRequest, "Failed to read form file", err)
				return
			}
			paths, err := parser.UnzipAndExtractFiles(file, constants.TempDirName)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Failed to extract zip", err)
				return
			}

			if len(paths) == 0 {
				utils.RespondWithError(w, http.StatusInternalServerError, "No valid JSON files in zip", err)
				return

			}

			parsedData, err := parser.ParseJsonFiles(paths)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "unable to parse JSON files", err)
			}

			minifiedData := parser.MinifyParsedData(parsedData)

			userSongData = append(userSongData, minifiedData...)

			for _, path := range paths {
				os.Remove(path)
			}

			file.Close()

		default:
			continue
		}
	}

	// TODO: RE-ENABLE THIS
	// err = parser.VerifyTrackArtistIDRelations(userSongData, cfg.DB)

	_, err = storeDataInDB(r, userSongData, cfg.DB)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "unable to store user data in database", err)
	}

	utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{})

}

func storeDataInDB(r *http.Request, data []parser.MinifiedSongData, db *database.Queries) (database.User, error) {
	ctx := r.Context()

	spotifyID := ctx.Value(constants.UserIDKey).(string)
	if spotifyID == "" {
		log.Printf("[storeDataInDB] No valid user_id in session!")
		return database.User{}, errors.New("no user ID in session")
	}

	blob, err := json.Marshal(data)
	if err != nil {
		return database.User{}, err
	}
	blobText := string(blob)

	existing, err := db.GetUserData(ctx, spotifyID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			newID := uuid.New().String()
			newUser, err := db.CreateUser(ctx, database.CreateUserParams{
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

	updatedUser, err := db.UpdateUser(ctx, database.UpdateUserParams{
		ID:   existing.ID,
		Data: blobText,
	})
	if err != nil {
		return database.User{}, fmt.Errorf("error updating user: %w", err)
	}

	return updatedUser, nil
}

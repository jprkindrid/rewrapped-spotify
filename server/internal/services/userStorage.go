package services

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
)

func StoreData(r *http.Request, data []parser.MinifiedSongData, db *database.Queries) (database.User, error) {
	ctx := r.Context()

	cfClient := storage.GetClient()

	spotifyID := ctx.Value(constants.UserIDKey).(string)
	if spotifyID == "" {
		log.Printf("[storeDataInDB] No valid user_id in session!")
		return database.User{}, errors.New("no user ID in session")
	}

	objKey, err := cfClient.UploadJSON(ctx, data, spotifyID)
	if err != nil {
		return database.User{}, err
	}

	existing, err := db.GetUserData(ctx, spotifyID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			newID := uuid.New().String()
			newUser, err := db.CreateUser(ctx, database.CreateUserParams{
				ID:         newID,
				SpotifyID:  spotifyID,
				StorageKey: objKey,
			})
			if err != nil {
				return database.User{}, fmt.Errorf("error creating new user: %w", err)
			}
			return newUser, nil
		}
		return database.User{}, fmt.Errorf("error checking for existing user: %w", err)
	}

	_ = cfClient.DeleteExistingBlob(ctx, existing.StorageKey)

	updatedUser, err := db.UpdateUser(ctx, database.UpdateUserParams{
		ID:         existing.ID,
		StorageKey: objKey,
	})
	if err != nil {
		return database.User{}, fmt.Errorf("error updating user: %w", err)
	}

	return updatedUser, nil
}

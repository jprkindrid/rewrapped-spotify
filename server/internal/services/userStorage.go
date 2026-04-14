package services

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
)

func StoreData(r *http.Request, data []parser.MinifiedSongData, db *database.Queries, cfg *config.Config) (database.User, error) {
	ctx := r.Context()

	cfClient := storage.GetClient(cfg)

	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		log.Printf("[storeDataInDB] No valid user_id in session!")
		return database.User{}, errors.New("no user ID in session")
	}

	objKey, err := cfClient.UploadJSON(ctx, data, userID)
	if err != nil {
		return database.User{}, err
	}

	existing, err := db.GetUserByEmail(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			newUser, err := db.CreateUser(ctx, database.CreateUserParams{
				Email:      userID,
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

	updatedUser, err := db.UpdateUserData(ctx, database.UpdateUserDataParams{
		Email:      existing.Email,
		StorageKey: objKey,
	})
	if err != nil {
		return database.User{}, fmt.Errorf("error updating user: %w", err)
	}

	return updatedUser, nil
}

package services

import (
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

// StoreData uploads data for the session's user (guest or account) and points
// their row at it, deleting the blob it replaces.
func StoreData(r *http.Request, data []parser.MinifiedSongData, db *database.Queries, cfg *config.Config) (database.User, error) {
	ctx := r.Context()

	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		log.Printf("[storeDataInDB] No valid user_id in session!")
		return database.User{}, errors.New("no user ID in session")
	}

	existing, err := db.GetUserByID(ctx, userID)
	if err != nil {
		return database.User{}, fmt.Errorf("error loading user: %w", err)
	}

	cfClient := storage.GetClient(cfg)

	objKey, err := cfClient.UploadJSON(ctx, data, userID)
	if err != nil {
		return database.User{}, err
	}

	updatedUser, err := db.UpdateUserStorageKey(ctx, database.UpdateUserStorageKeyParams{
		ID:         existing.ID,
		StorageKey: objKey,
	})
	if err != nil {
		_ = cfClient.DeleteExistingBlob(ctx, objKey)
		return database.User{}, fmt.Errorf("error updating user: %w", err)
	}

	if existing.StorageKey != "" {
		_ = cfClient.DeleteExistingBlob(ctx, existing.StorageKey)
	}

	return updatedUser, nil
}

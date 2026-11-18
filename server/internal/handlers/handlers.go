package handlers

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/cache"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/email"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
)

type ApiConfig struct {
	DB        *database.Queries
	Env       *config.Config
	DataCache *cache.UserDataCache
	// Email is nil when email isn't configured; email features then 503.
	Email email.Sender
	// Sessions validates session tokens; Invalidate after revoking a user's.
	Sessions *middleware.SessionChecker
}

// loadUserData returns the user's listening history from the cache or
// storage. On failure it also returns the HTTP status to respond with.
func (cfg *ApiConfig) loadUserData(ctx context.Context, userID string) ([]parser.MinifiedSongData, int, error) {
	if data, ok := cfg.DataCache.Get(userID); ok {
		return data, http.StatusOK, nil
	}

	dbUser, err := cfg.DB.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, http.StatusNotFound, fmt.Errorf("user not found")
		}
		return nil, http.StatusInternalServerError, fmt.Errorf("failed to load user: %w", err)
	}

	if dbUser.StorageKey == "" {
		return nil, http.StatusNotFound, fmt.Errorf("no listening history uploaded yet")
	}

	data, err := storage.GetClient(cfg.Env).GetJSON(ctx, dbUser.StorageKey)
	if err != nil {
		return nil, http.StatusInternalServerError, fmt.Errorf("failed to load user data: %w", err)
	}

	cfg.DataCache.Set(userID, data)
	return data, http.StatusOK, nil
}

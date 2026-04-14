package handlers

import (
	"github.com/jprkindrid/rewrapped-spotify/internal/cache"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

type ApiConfig struct {
	DB        *database.Queries
	Env       *config.Config
	DataCache *cache.UserDataCache
}

type Handlers struct {
	db *database.Queries
}

func NewHandlers(db *database.Queries) *Handlers {
	return &Handlers{
		db: db,
	}
}

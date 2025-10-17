package handlers

import (
	"github.com/jprkindrid/rewrapped-spotify/internal/authcode"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

type ApiConfig struct {
	DB        *database.Queries
	AuthCodes *authcode.Store
}

type Handlers struct {
	db *database.Queries
}

func NewHandlers(db *database.Queries) *Handlers {
	return &Handlers{
		db: db,
	}
}

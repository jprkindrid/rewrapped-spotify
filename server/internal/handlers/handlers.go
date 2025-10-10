package handlers

import (
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

type ApiConfig struct {
	DB *database.Queries
}

type Handlers struct {
	db *database.Queries
}

func NewHandlers(db *database.Queries) *Handlers {
	return &Handlers{
		db: db,
	}
}

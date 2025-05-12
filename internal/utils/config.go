package utils

import "github.com/jprkindrid/rewrapped-spotify/internal/database"

var Cfg *Config

type Config struct {
	DB *database.Queries
}

func InitConfig(cfg *Config) {
	Cfg = cfg
}

package dbConn

import (
	"database/sql"
	"log"
	"log/slog"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	_ "github.com/mattn/go-sqlite3"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

func Open(cfg *config.Config) *sql.DB {
	if cfg.Server.ProductionBuild {
		if cfg.Database.TursoURL == "" || cfg.Database.TursoToken == "" {
			log.Fatal("Turso database URL and auth token must be configured for production")
		}

		dbConn, err := sql.Open("libsql", cfg.Database.TursoURL+"?authToken="+cfg.Database.TursoToken)
		if err != nil {
			log.Fatalf("Error opening production DB: %v", err)
		}
		slog.Info("[Connection] connected to db", "db_url", cfg.Database.TursoURL)
		return dbConn
	}

	dbPath := cfg.Database.Path
	if cfg.Server.IsDocker && cfg.Database.PathDocker != "" {
		dbPath = cfg.Database.PathDocker
	}

	dbConn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Error opening local DB: %v", err)
	}

	slog.Info("[Connection] connected to db", "db_url", dbPath)

	return dbConn
}

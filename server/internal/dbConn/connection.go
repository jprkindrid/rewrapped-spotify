package dbConn

import (
	"database/sql"
	"log"
	"log/slog"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	_ "github.com/mattn/go-sqlite3"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

func Open() *sql.DB {
	cfg := config.Get()

	if cfg.ProductionBuild {
		if cfg.TursoURL == "" || cfg.TursoToken == "" {
			log.Fatal("Turso database URL and auth token must be configured for production")
		}

		dbConn, err := sql.Open("libsql", cfg.TursoURL+"?authToken="+cfg.TursoToken)
		if err != nil {
			log.Fatalf("Error opening production DB: %v", err)
		}
		slog.Info("[Connection] connected to db", "db_url", cfg.TursoURL)
		return dbConn
	}

	dbPath := cfg.DBPath
	if cfg.IsDocker && cfg.DBPathDocker != "" {
		dbPath = cfg.DBPathDocker
	}

	dbConn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Error opening local DB: %v", err)
	}

	slog.Info("[Connection] connected to db", "db_url", dbPath)

	return dbConn
}

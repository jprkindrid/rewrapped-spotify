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
		if cfg.TursoURL == "" {
			log.Fatal("TURSO_DATABASE_URL must be set in production")
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
	if dbPath == "" {
		log.Fatal("DB_PATH or DB_PATH_DOCKER environment variables must be set")
	}

	dbConn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Error opening local DB: %v", err)
	}

	slog.Info("[Connection] connected to db", "db_url", dbPath)

	return dbConn
}

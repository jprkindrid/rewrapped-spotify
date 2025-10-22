package dbConn

import (
	"database/sql"
	"log"
	"log/slog"
	"os"

	_ "github.com/mattn/go-sqlite3"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

func Open() *sql.DB {
	isProd := os.Getenv("PRODUCTION_BUILD") == "TRUE"

	if isProd {
		dbURL := os.Getenv("TURSO_DATABASE_URL")
		dbToken := os.Getenv("TURSO_AUTH_TOKEN")

		if dbURL == "" {
			log.Fatal("TURSO_DATABASE_URL must be set in production")
		}

		dbConn, err := sql.Open("libsql", dbURL+"?authToken="+dbToken)
		if err != nil {
			log.Fatalf("Error opening production DB: %v", err)
		}
		slog.Info("[Connection] connected to db", "db_url", dbURL)
		return dbConn
	}

	dbPath := os.Getenv("DB_PATH")
	if os.Getenv("DOCKER") != "" {
		if dockerPath := os.Getenv("DB_PATH_DOCKER"); dockerPath != "" {
			dbPath = dockerPath
		}
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

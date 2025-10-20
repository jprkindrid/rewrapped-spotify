package dbConn

import (
	"database/sql"
	"log"
	"os"
)

func Open() *sql.DB {
	isProd := os.Getenv("PRODUCTION") == "true"

	if isProd {
		dbURL := os.Getenv("DATABASE_URL")
		dbToken := os.Getenv("DATABASE_AUTH_TOKEN")

		if dbURL == "" {
			log.Fatal("DATABASE_URL must be set in production")
		}

		dsn := dbURL
		if dbToken != "" {
			dsn += "?authToken=" + dbToken
		}

		dbConn, err := sql.Open("libsql", dsn)
		if err != nil {
			log.Fatalf("Error opening production DB: %v", err)
		}
		return dbConn
	}

	// Local SQLite config
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

	return dbConn
}

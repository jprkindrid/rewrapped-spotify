package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

func main() {

	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load("../.env")
	}

	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	if spotifyClientID == "" {
		log.Fatal("SPOTIFY_CLIENT_ID must be set")
	}

	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	if spotifyClientSecret == "" {
		log.Fatal("SPOTIFY_CLIENT_SECRET must be set")
	}

	dbPath := os.Getenv("DB_PATH")
	if os.Getenv("DOCKER") != "" {
		dockerDBPath := os.Getenv("DB_PATH_DOCKER")
		if dockerDBPath != "" {
			dbPath = dockerDBPath
		}
	}
	if dbPath == "" {
		log.Fatal("DB_PATH or DB_PATH_DOCKER must be set")
	}

	dbConn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Error opening database: %s", err)
	}

	_, err = spotify.GetValidToken()
	if err != nil {
		log.Fatalf("Error getting valid spotify API token: %v", err)
	}

	dbQueries := database.New(dbConn)

	cfg := &handlers.ApiConfig{
		DB: dbQueries,
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// addr := "127.0.0.1:" + port
	// debugging
	addr := "0.0.0.0:8080"

	if os.Getenv("DOCKER") == "" {
		addr = "127.0.0.1:8080"
	}
	auth.NewAuth()

	mux := http.NewServeMux()

	//api
	mux.HandleFunc("GET /health", cfg.HandlerHealth)
	mux.HandleFunc("POST /api/upload", cfg.HandlerUpload)
	mux.HandleFunc("GET /api/summary", cfg.HandlerSummary)
	mux.HandleFunc("GET /auth/spotify/login", cfg.HandlerLogin)
	mux.HandleFunc("GET /auth/spotify/callback", cfg.HandlerCallback)
	mux.HandleFunc("GET /api/user", cfg.HandlerUser)
	mux.HandleFunc("GET /callback", cfg.HandlerCallback)
	mux.HandleFunc("POST /auth/logout", cfg.HandlerLogout)
	mux.HandleFunc("DELETE /api/delete", cfg.HandlerDelete)

	allowedOrigins := []string{"http://127.0.0.1:5173", " https://127.0.0.1:5173", " http://127.0.0.1:8080", "http://127.0.0.1:8080"}

	if os.Getenv("PRODUCTION_BUILD") == "TRUE" {
		allowedOrigins = []string{"INSERT URL HERE"}
		log.Fatal("REDIRECT URL NOT YET SET UP")
	}

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	srv := http.Server{
		Handler:      corsHandler.Handler(mux),
		Addr:         addr,
		WriteTimeout: constants.HTTPWriteTimeout * time.Second,
		ReadTimeout:  constants.HTTPReadTimeout * time.Second,
	}

	log.Printf("Server running at http://%s\n", addr)

	log.Fatal(srv.ListenAndServe())
}

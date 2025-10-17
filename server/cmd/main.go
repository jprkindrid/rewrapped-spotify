package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/authcode"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

func main() {

	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load("./.env")
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
		DB:        dbQueries,
		AuthCodes: authcode.NewStore(60 * time.Second),
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
	mux.HandleFunc("GET /auth/spotify/login", cfg.HandlerLogin)
	mux.HandleFunc("GET /auth/spotify/callback", cfg.HandlerCallback)
	mux.HandleFunc("POST /auth/exchange", cfg.HandlerExchange)
	mux.Handle("POST /api/upload", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerUpload)))
	mux.Handle("GET /api/summary", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerSummary)))
	// mux.Handle("POST /auth/logout", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerLogout))) // No longer needed for now
	mux.Handle("DELETE /api/delete", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerDelete)))

	allowedOrigins := []string{"http://127.0.0.1:5173", " https://127.0.0.1:5173", "http://127.0.0.1:4173", " https://127.0.0.1:4173", " http://127.0.0.1:8080", "http://127.0.0.1:8080"}

	if os.Getenv("PRODUCTION_BUILD") == "TRUE" {
		allowedOrigins = []string{"https://rewrapped-spotify.pages.dev"}
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

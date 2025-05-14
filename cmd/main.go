package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load()
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

	// initializing config in utils package so database can be passed without handlers being methods of config
	utils.InitConfig(&utils.Config{
		DB: dbQueries,
	})

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

	// pages
	mux.HandleFunc("/", handlers.HomeHandler)
	mux.HandleFunc("/upload", handlers.UploadPageHandler)
	mux.Handle("/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir("./web/static"))),
	)

	//api
	mux.HandleFunc("POST /api/upload", handlers.UploadHandler)
	mux.HandleFunc("GET /api/summary", handlers.SummaryHandler)
	mux.HandleFunc("GET /auth/spotify", handlers.LoginHandler)
	mux.HandleFunc("GET /auth/spotify/callback", handlers.CallbackHandler)
	mux.HandleFunc("GET /callback", handlers.CallbackHandler)
	mux.HandleFunc("POST /auth/logout", handlers.LogoutHandler)

	srv := http.Server{
		Handler:      mux,
		Addr:         addr,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
	}

	log.Printf("Server running at http://%s\n", addr)

	log.Fatal(srv.ListenAndServe())
}

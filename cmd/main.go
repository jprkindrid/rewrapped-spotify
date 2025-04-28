package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/kindiregg/spotify-data-analyzer/internal/auth"
	"github.com/kindiregg/spotify-data-analyzer/internal/database"
	"github.com/kindiregg/spotify-data-analyzer/internal/handlers"
	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
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
	if dbPath == "" {
		log.Fatal("DB_PATH must be set")
	}

	dbConn, err := sql.Open("sqlite3", "data/userdata.sqlite")
	if err != nil {
		log.Fatalf("Error opening database: %s", err)
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

	addr := "127.0.0.1:" + port
	// const addr = ":8080"

	if os.Getenv("DOCKER") != "" {
		addr = "0.0.0.0:8080"
	}
	auth.NewAuth()

	mux := http.NewServeMux()

	// pages
	mux.HandleFunc("/", handlers.HomeHandler)
	mux.HandleFunc("/upload", handlers.UploadPageHandler)
	mux.Handle("/public/",
		http.StripPrefix("/public/", http.FileServer(http.Dir("./web/public"))),
	)

	//api
	mux.HandleFunc("POST /api/upload", handlers.UploadHandler)
	mux.HandleFunc("GET /api/summary", handlers.SummaryHandler)
	mux.HandleFunc("GET /auth/spotify", handlers.LoginHandler)
	mux.HandleFunc("GET /auth/spotify/callback", handlers.CallbackHandler)

	srv := http.Server{
		Handler:      mux,
		Addr:         addr,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
	}

	log.Printf("Server running at http://%s\n", addr)

	log.Fatal(srv.ListenAndServe())
}

package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/kindiregg/spotify-data-analyzer/internal/auth"
	"github.com/kindiregg/spotify-data-analyzer/internal/handlers"
)

func main() {

	godotenv.Load()
	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	if spotifyClientID == "" {
		log.Fatal("SPOTIFY_CLIENT_ID must be set")
	}

	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	if spotifyClientSecret == "" {
		log.Fatal("SPOTIFY_CLIENT_SECRET must be set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	// const addr = ":8080"

	auth.NewAuth()

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./web/static")))

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

	log.Printf("Server running at http://localhost%s\n", addr)
	log.Fatal(srv.ListenAndServe())
}

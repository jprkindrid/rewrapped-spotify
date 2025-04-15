package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/kindiregg/spotify-data-analyzer/internal/handlers"
)

func main() {

	godotenv.Load()
	devClientID := os.Getenv("DEV_CLIENT_ID")
	if devClientID == "" {
		log.Fatal("DEV_CLIENT_ID must be set")
	}

	godotenv.Load()
	devClientSecret := os.Getenv("DEV_CLIENT_SECRET")
	if devClientSecret == "" {
		log.Fatal("DEV_CLIENT_SECRET must be set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	// const addr = ":8080"

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./static")))

	mux.HandleFunc("POST /api/upload", handlers.UploadHandler)
	mux.HandleFunc("GET /api/summary", handlers.SummaryHandler)

	srv := http.Server{
		Handler:      mux,
		Addr:         addr,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
	}

	// artistID := "5ACAhZZPLo1ukYpA4jLO6u" //Kindrid
	// requestedArtist, err := spotify.GetArtistData(cachedToken.AccessToken, artistID)
	// if err != nil {
	// 	fmt.Printf("error getting requested artist: %v", err)
	// }

	// fmt.Printf("%+v\n", requestedArtist)

	log.Printf("Server running at http://localhost%s\n", addr)
	log.Fatal(srv.ListenAndServe())
}

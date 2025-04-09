package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/kindiregg/spotify-data-analyzer/internal/spotify"
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

	var cachedToken *spotify.CachedToken
	cachedToken, err := spotify.LoadCachedToken("token_cache.json")

	if err != nil || time.Now().After(cachedToken.ExpiresAt.Add(-1*time.Minute)) {
		fmt.Println("No valid access token found, fetching new token...")
		cachedToken, err = spotify.GetAccessToken(devClientID, devClientSecret)
		if err != nil {
			log.Fatalf("Failed to get access token: %v", err)
			return
		}
	} else {
		fmt.Println("using cached token")
	}

	if cachedToken.AccessToken == "" {
		log.Fatal("Received empty access token")
	}

	artistID := "5ACAhZZPLo1ukYpA4jLO6u" //Kindrid
	requestedArtist, err := spotify.GetArtistData(cachedToken.AccessToken, artistID)
	if err != nil {
		fmt.Printf("error getting requested artist: %v", err)
	}

	fmt.Printf("%+v\n", requestedArtist)
}

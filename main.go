package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type userSongData []struct {
	Ts                            time.Time `json:"ts"`
	Username                      string    `json:"username"`
	Platform                      string    `json:"platform"`
	MsPlayed                      int       `json:"ms_played"` // time milliseconds
	ConnCountry                   string    `json:"conn_country"`
	IPAddrDecrypted               string    `json:"ip_addr_decrypted"`
	UserAgentDecrypted            string    `json:"user_agent_decrypted"`
	MasterMetadataTrackName       string    `json:"master_metadata_track_name"`
	MasterMetadataAlbumArtistName string    `json:"master_metadata_album_artist_name"`
	MasterMetadataAlbumAlbumName  string    `json:"master_metadata_album_album_name"`
	SpotifyTrackURI               string    `json:"spotify_track_uri"`
	EpisodeName                   string    `json:"episode_name"`
	EpisodeShowName               string    `json:"episode_show_name"`
	SpotifyEpisodeURI             string    `json:"spotify_episode_uri"`
	ReasonStart                   string    `json:"reason_start"`
	ReasonEnd                     string    `json:"reason_end"`
	Shuffle                       bool      `json:"shuffle"`
	Skipped                       bool      `json:"skipped"`
	Offline                       bool      `json:"offline"`
	OfflineTimestamp              int       `json:"offline_timestamp"`
	IncognitoMode                 bool      `json:"incognito_mode"`
}

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

	var cachedToken *CachedToken
	cachedToken, err := loadCachedToken("token_cache.json")

	if err != nil || time.Now().After(cachedToken.ExpiresAt.Add(-1*time.Minute)) {
		fmt.Println("No valid access token found, fetching new token...")
		cachedToken, err = getAccessToken(devClientID, devClientSecret)
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
	requestedArtist, err := getArtistData(cachedToken.AccessToken, artistID)
	if err != nil {
		fmt.Printf("error getting requested artist: %v", err)
	}

	fmt.Printf("%+v\n", requestedArtist)
}

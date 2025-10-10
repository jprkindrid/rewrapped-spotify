package auth

import (
	"encoding/gob"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/spotify"
)

const (
	MaxAge = constants.SessionMaxAge
)

func NewAuth() {
	if os.Getenv("DOCKER") == "" {
		if err := godotenv.Load("../.env"); err != nil {
			log.Printf("Warning: Error loading .env file: %v", err)
		}
	}

	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	callback := os.Getenv("SPOTIFY_REDIRECT_URI")

	if spotifyClientID == "" || spotifyClientSecret == "" || callback == "" {
		log.Fatal("Missing required Spotify credentials in environment")
	}

	secret := os.Getenv("SESSION_SECRET")
	if len(secret) < constants.MinSessionSecretLength {
		panic("SESSION_SECRET must be at least 32 characters")
	}

	sessionKey := []byte(secret)
	store := sessions.NewCookieStore(sessionKey)
	if os.Getenv("PRODUCTION_BUILD") == "TRUE" {
		store.Options = &sessions.Options{
			Path:     "/",
			Domain:   "",
			MaxAge:   86400,
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode,
		}
	} else {
		store.Options = &sessions.Options{
			Path:     "/",
			Domain:   "127.0.0.1",
			MaxAge:   86400,
			HttpOnly: true,
			Secure:   false,
			SameSite: http.SameSiteLaxMode,
		}
	}
	gob.Register(map[string]any{})
	gob.Register([]any{})
	gob.Register("")
	gob.Register(true)

	goth.UseProviders(
		spotify.New(
			spotifyClientID,
			spotifyClientSecret,
			callback,
			"user-read-email",
			"user-read-private",
		),
	)

	gothic.Store = store

	log.Printf("[NewAuth] Initialized auth with provider=spotify, callback=%s", callback)
}

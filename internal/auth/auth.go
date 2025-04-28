package auth

import (
	"encoding/gob"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/spotify"
)

const (
	MaxAge = 86400 * 30 // 30 days
)

func NewAuth() {
	// Load env only once
	if os.Getenv("DOCKER") == "" {
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: Error loading .env file: %v", err)
		}
	}

	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	callback := os.Getenv("SPOTIFY_REDIRECT_URI")

	if spotifyClientID == "" || spotifyClientSecret == "" || callback == "" {
		log.Fatal("Missing required Spotify credentials in environment")
	}

	// Use a consistent key for sessions
	sessionKey := []byte("spotify-data-analyzer-session-key-v1")
	store := sessions.NewCookieStore(sessionKey)

	// Set consistent session options
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   MaxAge,
		HttpOnly: true,
		Secure:   false, // Must be false for localhost HTTP
		SameSite: http.SameSiteLaxMode,
	}

	// Register all types we store in sessions
	gob.Register(map[string]any{})
	gob.Register([]any{})
	gob.Register("")
	gob.Register(true)

	// Configure Gothic to use our store
	gothic.Store = store

	// Configure Spotify OAuth provider with additional scopes
	goth.UseProviders(
		spotify.New(
			spotifyClientID,
			spotifyClientSecret,
			callback,
			"user-read-email",
			"user-read-private",
		),
	)

	log.Printf("[NewAuth] Initialized auth with provider=spotify, callback=%s", callback)
}

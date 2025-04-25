package auth

import (
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/spotify"
)

const (
	key    = "wowAKewlKey"
	MaxAge = 84600 * 30
	IsProd = false
)

func NewAuth() {
	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load()
	}

	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)

	store.Options = &sessions.Options{
		Path:     "/",
		HttpOnly: true,
		Secure:   IsProd,
		SameSite: http.SameSiteLaxMode,
	}

	gothic.Store = store

	godotenv.Load()
	callback := os.Getenv("SPOTIFY_REDIRECT_URI")

	goth.UseProviders(
		spotify.New(spotifyClientID, spotifyClientSecret, callback, "user-read-email"),
	)

}

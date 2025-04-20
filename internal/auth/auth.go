package auth

import (
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
	key    = "wowAKewlKey"
	MaxAge = 84600 * 30
	IsProd = false
)

func NewAuth() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loading .env file")
	}
	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)

	store.Options = &sessions.Options{
		Path:     "/",
		Domain:   "127.0.0.1", // ← force it onto 127.0.0.1 only
		HttpOnly: true,
		Secure:   false, // plain‐HTTP local dev
		SameSite: http.SameSiteLaxMode,
	}

	gothic.Store = store

	callback := "http://127.0.0.1:8080/auth/spotify/callback"

	goth.UseProviders(
		spotify.New(spotifyClientID, spotifyClientSecret, callback, "user-read-email"),
	)

}

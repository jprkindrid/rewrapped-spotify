package auth

import (
	"encoding/gob"
	"log"
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/spotify"
)

const (
	MaxAge = constants.SessionMaxAge
)

func NewAuth(cfg *config.Config) {

	if !cfg.Server.IsDocker {
		if err := godotenv.Load("../.env"); err != nil {
			log.Printf("Warning: Error loading .env file: %v", err)
		}
	}

	secret := cfg.Auth.SessionSecret
	if len(secret) < constants.MinSessionSecretLength {
		panic("SESSION_SECRET must be at least 32 characters")
	}

	sessionKey := []byte(secret)
	store := sessions.NewCookieStore(sessionKey)
	if cfg.Server.ProductionBuild {
		store.Options = &sessions.Options{
			Path:     "/",
			Domain:   "api-rewrapped-spotify.fly.dev",
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
			cfg.Spotify.ClientID,
			cfg.Spotify.Secret,
			cfg.Spotify.RedirectURI,
			"user-read-email",
			"user-read-private",
		),
	)

	gothic.Store = store

	log.Printf("[NewAuth] Initialized auth with provider=spotify, callback=%s", cfg.Spotify.RedirectURI)
}

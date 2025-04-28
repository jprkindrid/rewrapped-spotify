package handlers

import (
	"log"
	"net/http"

	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
	"github.com/markbates/goth/gothic"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Clear any existing session
	session, _ := gothic.Store.Get(r, gothic.SessionName)
	session.Options.MaxAge = -1
	session.Save(r, w)

	// Start auth process
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(w, r)
}

func CallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Set provider in query
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	log.Printf("[CallbackHandler] Starting callback handling with provider=spotify")

	// Get user data from Spotify
	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("[CallbackHandler] gothic.CompleteUserAuth error: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Auth error: "+err.Error(), err)
		return
	}

	// Get new session
	session, err := gothic.Store.New(r, gothic.SessionName)
	if err != nil {
		log.Printf("[CallbackHandler] Error creating new session: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Session error: "+err.Error(), err)
		return
	}

	// Set session values
	session.Values["provider"] = "spotify"
	session.Values["user_id"] = user.UserID
	session.Values["access_token"] = user.AccessToken

	// Save session before redirect
	if err := session.Save(r, w); err != nil {
		log.Printf("[CallbackHandler] Error saving session: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save session: "+err.Error(), err)
		return
	}

	log.Printf("[CallbackHandler] Successfully saved session for user %s", user.UserID)

	// Set cache control headers
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")

	// Redirect to upload page
	http.Redirect(w, r, "/upload", http.StatusFound)
}

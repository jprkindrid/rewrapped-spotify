package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
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
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Auth error: "+err.Error(), err)
		return
	}

	session, err := gothic.Store.New(r, gothic.SessionName)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Session error: "+err.Error(), err)
		return
	}

	session.Values["provider"] = "spotify"
	session.Values["user_id"] = user.UserID
	session.Values["access_token"] = user.AccessToken

	if err := session.Save(r, w); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save session: "+err.Error(), err)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")

	http.Redirect(w, r, "/upload", http.StatusSeeOther)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	err := gothic.Logout(w, r)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error logging out", err)
	}
	http.Redirect(w, r, "/", http.StatusFound)
}

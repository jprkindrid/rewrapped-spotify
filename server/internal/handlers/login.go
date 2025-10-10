package handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/markbates/goth/gothic"
)

func (cfg *ApiConfig) HandlerLogin(w http.ResponseWriter, r *http.Request) {
	session, _ := gothic.Store.Get(r, gothic.SessionName)
	session.Options.MaxAge = -1
	session.Save(r, w)

	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()
}

func (cfg *ApiConfig) HandlerCallback(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("[Callback] CompleteUserAuth error: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] Auth Error: "+err.Error(), err)
		return
	}

	session, _ := gothic.Store.Get(r, gothic.SessionName)

	session.Values["provider"] = "spotify"
	session.Values["user_id"] = user.UserID
	session.Values["user_name"] = user.Name

	if err := session.Save(r, w); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save session: "+err.Error(), err)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")

	frontendURL := os.Getenv("FRONTEND_REDIRECT_URL")

	http.Redirect(w, r, frontendURL, http.StatusSeeOther)
}

func (cfg *ApiConfig) HandlerLogout(w http.ResponseWriter, r *http.Request) {
	err := gothic.Logout(w, r)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error logging out", err)
	}
	http.Redirect(w, r, "/", http.StatusFound)
}

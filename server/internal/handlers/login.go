package handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/markbates/goth/gothic"
)

func (cfg *ApiConfig) HandlerLogin(w http.ResponseWriter, r *http.Request) {

	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(w, r)
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

	appSession, err := gothic.Store.Get(r, constants.UserSession)
	if err != nil {
		log.Printf("[Callback] User Session error: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] Auth Error: "+err.Error(), err)
		return
	}

	appSession.Values["user_id"] = user.UserID
	appSession.Values["display_name"] = user.Name
	appSession.Values["spotify_access_token"] = user.AccessToken
	appSession.Save(r, w)

	gothic.Logout(w, r)

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

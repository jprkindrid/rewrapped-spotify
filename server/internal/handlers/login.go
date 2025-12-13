package handlers

import (
	"fmt"
	"log"
	"net/http"

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

	defer gothic.Logout(w, r)

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("[Callback] CompleteUserAuth error: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] Auth Error: "+err.Error(), err)
		return
	}

	authCode, err := cfg.AuthCodes.GenerateCodes(user.UserID, user.Name)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] failed to generate auth code", err)
		return

	}

	redirectUrl := fmt.Sprintf("%s?auth_code=%s", cfg.Env.Server.FrontendRedirectURL, authCode)
	http.Redirect(w, r, redirectUrl, http.StatusSeeOther)
}

// func (cfg *ApiConfig) HandlerLogout(w http.ResponseWriter, r *http.Request) {

// 	ctx := r.Context()

// 	appSession, err := gothic.Store.Get(r, constants.UserSession)
// 	if err != nil {
// 		log.Printf(("[Logout] Error getting user session"))
// 		utils.RespondWithError(w, http.StatusInternalServerError, "[Logout] Auth Error: "+err.Error(), err)

// 	}
// 	appSession.Options.MaxAge = -1
// 	appSession.Save(r, w)
// 	gothic.Logout(w, r)

// 	log.Println("[Logout] Logging out user")
// 	utils.RespondWithJSON(w, http.StatusNoContent, "logout successful")
// }
// We no longer need this since switching to JWT

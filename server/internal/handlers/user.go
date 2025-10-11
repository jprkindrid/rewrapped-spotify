package handlers

import (
	"log"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/markbates/goth/gothic"
)

func (cfg *ApiConfig) HandlerUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(constants.UserSession)
	if err != nil || cookie.Value == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No session cookie", nil)
		return
	}

	log.Printf("Found cookie: %s", cookie.Name)

	session, err := gothic.Store.Get(r, constants.UserSession)
	if err != nil {
		log.Printf("Error getting session: %v", err)
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid session", err)
		return
	}

	userID, ok := session.Values["user_id"].(string)
	if !ok || userID == "" {
		log.Printf("No user_id in session. Session values: %v", session.Values)
		utils.RespondWithError(w, http.StatusUnauthorized, "Not authenticated", nil)
		return
	}

	displayName, _ := session.Values["display_name"].(string)

	resBody := map[string]string{
		"user_id":      userID,
		"display_name": displayName,
	}
	utils.RespondWithJSON(w, http.StatusOK, resBody)
}

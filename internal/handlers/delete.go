package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/markbates/goth/gothic"
)

func DeleteHandler(w http.ResponseWriter, r *http.Request) {
	session, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid session", err)
		return
	}

	userID, ok := session.Values["user_id"].(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	err = utils.Cfg.DB.DeleteUser(r.Context(), userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error deleting user data", err)
		return
	}

	session.Options.MaxAge = -1
	if err := session.Save(r, w); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error clearing session", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "successfully deleted user data",
	})
}

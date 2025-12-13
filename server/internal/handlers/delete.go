package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func (cfg *ApiConfig) HandlerDelete(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	userID := ctx.Value(constants.UserIDKey).(string)
	if userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	dbUser, err := cfg.DB.GetUserData(ctx, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error getting user data for deletion", err)
		return
	}

	cfClient := storage.GetClient()

	err = cfClient.DeleteExistingBlob(ctx, dbUser.StorageKey)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error deleting user data from bucket", err)
		return
	}

	err = cfg.DB.DeleteUser(ctx, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error deleting user entry from db", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "successfully deleted user data",
	})
}

package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

// HandlerDelete removes the session's user and their data. Works for guests
// and accounts alike.
func (cfg *ApiConfig) HandlerDelete(w http.ResponseWriter, r *http.Request) {
	user, ok := cfg.sessionUser(w, r)
	if !ok {
		return
	}

	ctx := r.Context()

	if user.StorageKey != "" {
		if err := storage.GetClient(cfg.Env).DeleteExistingBlob(ctx, user.StorageKey); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "error deleting user data from bucket", err)
			return
		}
	}

	if err := cfg.DB.DeleteUserByID(ctx, user.ID); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error deleting user entry from db", err)
		return
	}

	cfg.DataCache.Delete(user.ID)
	cfg.Sessions.Invalidate(user.ID)

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "successfully deleted user data",
	})
}

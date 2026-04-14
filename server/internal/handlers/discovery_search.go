package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/discovery"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

type DiscoverySearchResponse struct {
	Artists []discovery.DiscoverySearchEntry `json:"artists"`
}

func (cfg *ApiConfig) HandlerDiscoverySearch(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	query := r.URL.Query().Get("query")
	if len(query) < 2 {
		utils.RespondWithError(w, http.StatusBadRequest, "query must be at least 2 characters", nil)
		return
	}

	data, ok := cfg.DataCache.Get(userID)
	if !ok {
		dbUser, err := cfg.DB.GetUserByEmail(ctx, userID)
		if err != nil {
			utils.RespondWithError(w, http.StatusNotFound, "User data not found", err)
			return
		}

		cfClient := storage.GetClient(cfg.Env)

		if data, err = cfClient.GetJSON(ctx, dbUser.StorageKey); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "failed to parse user data from database", err)
			return
		}
		cfg.DataCache.Set(userID, data)
	}

	results := discovery.SearchArtistDiscovery(data, query, discovery.DefaultSearchLimit)

	utils.RespondWithJSON(w, http.StatusOK, DiscoverySearchResponse{
		Artists: results,
	})
}

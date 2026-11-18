package handlers

import (
	"net/http"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/search"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

type DiscoverySearchResponse struct {
	Artists []search.RankedSearchEntry `json:"artists"`
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

	data, status, err := cfg.loadUserData(ctx, userID)
	if err != nil {
		utils.RespondWithError(w, status, err.Error(), err)
		return
	}

	sortBy := r.URL.Query().Get("sort_by")
	if sortBy != constants.SortByTime {
		sortBy = constants.SortByCount
	}

	results := search.SearchRanked(data, search.RankedSearchOptions{
		Query:  query,
		Entity: search.EntityArtist,
		SortBy: sortBy,
		Start:  time.Time{},
		End:    time.Time{},
		Limit:  search.DefaultSearchLimit,
		Offset: 0,
	})

	utils.RespondWithJSON(w, http.StatusOK, DiscoverySearchResponse{
		Artists: results,
	})
}

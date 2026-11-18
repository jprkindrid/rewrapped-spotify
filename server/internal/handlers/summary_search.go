package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/search"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

type SummarySearchResponse struct {
	Results []search.RankedSearchEntry `json:"results"`
}

func (cfg *ApiConfig) HandlerSummarySearch(w http.ResponseWriter, r *http.Request) {
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

	entity := search.NormalizeEntity(r.URL.Query().Get("entity"))
	sortBy := r.URL.Query().Get("sort_by")
	if sortBy != constants.SortByTime {
		sortBy = constants.SortByCount
	}

	start, err := time.Parse(time.RFC3339, r.URL.Query().Get("start"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "start must be RFC3339", err)
		return
	}

	end, err := time.Parse(time.RFC3339, r.URL.Query().Get("end"))
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "end must be RFC3339", err)
		return
	}

	if start.After(end) {
		utils.RespondWithError(w, http.StatusBadRequest, "start must be before end", nil)
		return
	}

	limit := search.DefaultSearchLimit
	if limitRaw := r.URL.Query().Get("limit"); limitRaw != "" {
		parsedLimit, parseErr := strconv.Atoi(limitRaw)
		if parseErr != nil || parsedLimit <= 0 {
			utils.RespondWithError(w, http.StatusBadRequest, "limit must be a positive integer", parseErr)
			return
		}
		limit = parsedLimit
	}

	offset := 0
	if offsetRaw := r.URL.Query().Get("offset"); offsetRaw != "" {
		parsedOffset, parseErr := strconv.Atoi(offsetRaw)
		if parseErr != nil || parsedOffset < 0 {
			utils.RespondWithError(w, http.StatusBadRequest, "offset must be a non-negative integer", parseErr)
			return
		}
		offset = parsedOffset
	}

	data, ok := cfg.DataCache.Get(userID)
	if !ok {
		dbUser, dbErr := cfg.DB.GetUserByEmail(ctx, userID)
		if dbErr != nil {
			utils.RespondWithError(w, http.StatusNotFound, "User data not found", dbErr)
			return
		}

		cfClient := storage.GetClient(cfg.Env)

		if data, dbErr = cfClient.GetJSON(ctx, dbUser.StorageKey); dbErr != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "failed to parse user data from database", dbErr)
			return
		}
		cfg.DataCache.Set(userID, data)
	}

	results := search.SearchRanked(data, search.RankedSearchOptions{
		Query:  query,
		Entity: entity,
		SortBy: sortBy,
		Start:  start,
		End:    end,
		Limit:  limit,
		Offset: offset,
	})

	utils.RespondWithJSON(w, http.StatusOK, SummarySearchResponse{
		Results: results,
	})
}

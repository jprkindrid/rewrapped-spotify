package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/bump"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/jprkindrid/rewrapped-spotify/internal/validation"
)

const NUM_ITEMS = 10

type BumpResponse struct {
	TopArtists []bump.ScoredEntry `json:"top_artists"`
	TopTracks  []bump.ScoredEntry `json:"top_tracks"`
}

func (cfg *ApiConfig) HandlerBumpChart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	data, ok := cfg.DataCache.Get(userID)
	if !ok {

		dbUser, err := cfg.DB.GetUserData(ctx, userID)
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

	timeParams, err := validation.ValidateTimeRange(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	sortParams := validation.ValidateSortParam(r)

	summaryArtists := summary.TopArtistsInRange(data, timeParams.Start, timeParams.End, sortParams.SortBy)
	summaryTracks := summary.TopTracksInRange(data, timeParams.Start, timeParams.End, sortParams.SortBy)

	topArtists := bump.SummaryToBump(summaryArtists)
	topTracks := bump.SummaryToBump(summaryTracks)

	// TODO: add a time parameter request (months or years probably) and then loop for each of the iteration in the givne time period

	utils.RespondWithJSON(w, http.StatusOK, BumpResponse{
		TopArtists: topArtists,
		TopTracks:  topTracks,
	})
}

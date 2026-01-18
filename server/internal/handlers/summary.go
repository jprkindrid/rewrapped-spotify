package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/jprkindrid/rewrapped-spotify/internal/validation"
)

type SummaryResponse struct {
	OffsetArtists      int                   `json:"offset_artists"`
	OffsetTracks       int                   `json:"offset_tracks"`
	Limit              int                   `json:"limit"`
	TotalArtistsCount  int                   `json:"total_artists_count"`
	TotalTracksCount   int                   `json:"total_tracks_count"`
	TopArtists         []summary.ScoredEntry `json:"top_artists"`
	TopTracks          []summary.ScoredEntry `json:"top_tracks"`
	TotalTimeListening int                   `json:"total_time_listening"`
}

func (cfg *ApiConfig) HandlerSummary(w http.ResponseWriter, r *http.Request) {
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

	paginationParams, err := validation.ValidatePaginationParams(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	sortParams := validation.ValidateSortParam(r)

	topArtists := summary.TopArtistsInRange(data, timeParams.Start, timeParams.End, sortParams.SortBy)
	topTracks := summary.TopTracksInRange(data, timeParams.Start, timeParams.End, sortParams.SortBy)
	artistLen := len(topArtists)
	trackLen := len(topTracks)
	startArtists := paginationParams.OffsetArtists
	startTracks := paginationParams.OffsetTracks
	endArtists := paginationParams.OffsetArtists + paginationParams.Limit
	endTracks := paginationParams.OffsetTracks + paginationParams.Limit

	if startArtists > artistLen {
		startArtists = max(0, artistLen-paginationParams.Limit)
	}
	if endArtists > artistLen {
		endArtists = artistLen
	}
	if startTracks > trackLen {
		startTracks = max(0, trackLen-paginationParams.Limit)
	}
	if endTracks > trackLen {
		endTracks = trackLen
	}

	var totalTimeListenedMS int
	for _, track := range topTracks {
		totalTimeListenedMS += track.TotalMs
	}

	var pagedArtists []summary.ScoredEntry
	var pagedTracks []summary.ScoredEntry

	if startArtists < artistLen && endArtists > startArtists {
		pagedArtists = topArtists[startArtists:endArtists]
	}

	if startTracks < trackLen && endTracks > startTracks {
		pagedTracks = topTracks[startTracks:endTracks]
	}

	utils.RespondWithJSON(w, http.StatusOK, SummaryResponse{
		OffsetArtists:      paginationParams.OffsetArtists,
		OffsetTracks:       paginationParams.OffsetTracks,
		Limit:              paginationParams.Limit,
		TotalArtistsCount:  artistLen,
		TotalTracksCount:   trackLen,
		TopArtists:         pagedArtists,
		TopTracks:          pagedTracks,
		TotalTimeListening: totalTimeListenedMS,
	})
}

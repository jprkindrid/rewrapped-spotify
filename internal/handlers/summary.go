package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/jprkindrid/rewrapped-spotify/internal/validation"
	"github.com/markbates/goth/gothic"
)

func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid session", err)
		return
	}

	userID, ok := sess.Values["user_id"].(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	dbUser, err := utils.Cfg.DB.GetUserData(ctx, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "User data not found", err)
		return
	}

	var data []parser.UserSongData
	if err := json.Unmarshal([]byte(dbUser.Data), &data); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to parse user data from database", err)
		return
	}

	// Validate time range parameters
	timeParams, err := validation.ValidateTimeRange(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Validate pagination parameters
	paginationParams, err := validation.ValidatePaginationParams(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Validate sort parameters
	sortParams := validation.ValidateSortParams(r)

	topArtists := summary.TopArtistsInRange(data, timeParams.Start, timeParams.End, sortParams.SortByArtists)
	topTracks := summary.TopTracksInRange(data, timeParams.Start, timeParams.End, sortParams.SortByTracks)
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

	// Ensure safe slicing with bounds checking
	var pagedArtists []summary.ScoredEntry
	var pagedTracks []summary.ScoredEntry

	if startArtists < artistLen && endArtists > startArtists {
		pagedArtists = topArtists[startArtists:endArtists]
	}

	if startTracks < trackLen && endTracks > startTracks {
		pagedTracks = topTracks[startTracks:endTracks]
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]any{
		"offset_artists":       paginationParams.OffsetArtists,
		"offset_tracks":        paginationParams.OffsetTracks,
		"limit":                paginationParams.Limit,
		"total_artists_count":  artistLen,
		"total_tracks_count":   trackLen,
		"top_artists":          pagedArtists,
		"top_tracks":           pagedTracks,
		"total_time_listening": totalTimeListenedMS,
	})
}

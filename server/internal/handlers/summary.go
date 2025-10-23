package handlers

import (
	"log/slog"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/jprkindrid/rewrapped-spotify/internal/validation"
)

func (cfg *ApiConfig) HandlerSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID := ctx.Value(constants.UserIDKey).(string)
	if userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	slog.Info("GETTING SUMMARY", "user ID", userID)

	dbUser, err := cfg.DB.GetUserData(ctx, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "User data not found", err)
		return
	}

	cfClient := storage.GetClient()

	var data []parser.MinifiedSongData
	if err := cfClient.GetJSON(ctx, dbUser.StorageKey, &data); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to parse user data from database", err)
		return
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

	spotifyClient := spotify.GetClient()

	hydratedTracks, err := spotifyClient.GetSummaryTrackArt(pagedTracks)
	if err != nil {
		slog.Error("[SUMMARY] Unable to hydrate album art and url for tracks")
	}

	hydratedArtists, err := spotifyClient.GetSummaryArtistArtAndID(pagedArtists)
	if err != nil {
		slog.Error("[SUMMARY] Unable to hydrate art and url for artists")
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]any{
		"offset_artists":       paginationParams.OffsetArtists,
		"offset_tracks":        paginationParams.OffsetTracks,
		"limit":                paginationParams.Limit,
		"total_artists_count":  artistLen,
		"total_tracks_count":   trackLen,
		"top_artists":          hydratedArtists,
		"top_tracks":           hydratedTracks,
		"total_time_listening": totalTimeListenedMS,
	})
}

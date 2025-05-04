package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/kindiregg/rewrapped-spotify/internal/parser"
	"github.com/kindiregg/rewrapped-spotify/internal/summary"
	"github.com/kindiregg/rewrapped-spotify/internal/utils"
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

	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")

	var timeStart time.Time
	var timeEnd time.Time
	if startStr == "" {
		timeStart = time.Time{}
	} else {
		timeStart, err = time.Parse(time.RFC3339, startStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusUnprocessableEntity, "invalid timeStart datetime, use RFC3339", err)
			timeStart = time.Time{}
		}
	}

	if endStr == "" {
		timeEnd = time.Now()
	} else {
		timeEnd, err = time.Parse(time.RFC3339, endStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusUnprocessableEntity, "invalid timeEnd datetime, use RFC3339", err)
			timeEnd = time.Now()
		}
	}

	offsetTrackStr := r.URL.Query().Get("offset_tracks")
	offsetArtistStr := r.URL.Query().Get("offset_artists")
	limitStr := r.URL.Query().Get("limit")

	offsetTracks, _ := strconv.Atoi(offsetTrackStr)
	offsetArtists, _ := strconv.Atoi(offsetArtistStr)
	limit, _ := strconv.Atoi(limitStr)

	if offsetTracks < 0 {
		offsetTracks = 0
	}
	if offsetArtists < 0 {
		offsetArtists = 0
	}
	if limit <= 0 {
		limit = 10
	}
	sortByArtists := r.URL.Query().Get("sort_by_artists")
	sortByTracks := r.URL.Query().Get("sort_by_tracks")

	if sortByArtists != "time" && sortByArtists != "count" {
		sortByArtists = "count"
	}
	if sortByTracks != "time" && sortByTracks != "count" {
		sortByTracks = "count"
	}

	topArtists := summary.TopArtistsInRange(data, timeStart, timeEnd, sortByArtists)
	topTracks := summary.TopTracksInRange(data, timeStart, timeEnd, sortByTracks)
	artistLen := len(topArtists)
	trackLen := len(topTracks)
	startArtists := offsetArtists
	startTracks := offsetTracks
	endArtists := offsetArtists + limit
	endTracks := offsetTracks + limit

	if startArtists > artistLen {
		startArtists = artistLen - limit
	}
	if endArtists > artistLen {
		endArtists = artistLen
	}
	if startTracks > trackLen {
		startTracks = trackLen - limit
	}
	if endTracks > trackLen {
		endTracks = trackLen
	}

	var totalTimeListenedMS int
	for _, track := range topTracks {
		totalTimeListenedMS += track.TotalMs
	}

	pagedArtists := topArtists[startArtists:endArtists]
	pagedTracks := topTracks[startTracks:endTracks]

	utils.RespondWithJSON(w, http.StatusOK, map[string]any{
		"offset_artists":       offsetArtists,
		"offset_tracks":        offsetTracks,
		"limit":                limit,
		"total_artists_count":  artistLen,
		"total_tracks_count":   trackLen,
		"top_artists":          pagedArtists,
		"top_tracks":           pagedTracks,
		"total_time_listening": totalTimeListenedMS,
	})
}

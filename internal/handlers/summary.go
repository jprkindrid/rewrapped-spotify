package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/kindiregg/spotify-data-analyzer/internal/parser"
	"github.com/kindiregg/spotify-data-analyzer/internal/summary"
	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
	"github.com/markbates/goth/gothic"
)

func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		log.Printf("Session error: %v", err)
		return
	}

	spotifyID, _ := sess.Values["user_id"].(string)
	if spotifyID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", err)
		return
	}

	dbUser, err := utils.Cfg.DB.GetUserData(ctx, spotifyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "user data not found", err)
		return
	}
	var data []parser.UserSongData
	if err := json.Unmarshal([]byte(dbUser.Data), &data); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to parse user data from database", err)
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

	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")

	offset, _ := strconv.Atoi(offsetStr)
	limit, _ := strconv.Atoi(limitStr)

	if offset < 0 {
		offset = 0
	}
	if limit <= 0 {
		limit = 10
	}

	topArtists := summary.TopArtistsInRange(data, timeStart, timeEnd)
	topTracks := summary.TopTracksInRange(data, timeStart, timeEnd)
	artistLen := len(topArtists)
	trackLen := len(topTracks)
	startArtists := offset
	startTracks := offset
	endArtists := offset + limit
	endTracks := offset + limit
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
		"offset":               offset,
		"limit":                limit,
		"total_artists_count":  artistLen,
		"total_tracks_count":   trackLen,
		"top_artists":          pagedArtists,
		"top_tracks":           pagedTracks,
		"total_time_listening": totalTimeListenedMS,
	})
}

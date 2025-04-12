package handlers

import (
	"net/http"
	"time"

	"github.com/kindiregg/spotify-data-analyzer/internal/session"
	"github.com/kindiregg/spotify-data-analyzer/internal/summary"
	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
)

func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	data := session.Get()

	// TODO: get timestamp from client
	start := time.Time{}
	end := time.Now()

	topArtists := summary.TopArtistsInRange(data, start, end)
	topTracks := summary.TopTracksInRange(data, start, end)

	utils.RespondWithJSON(w, http.StatusOK, map[string]any{
		"top_artists": topArtists[:10],
		"top_tracks":  topTracks[:10],
	})
}

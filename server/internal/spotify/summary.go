package spotify

import (
	"log/slog"

	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
)

type trackInfo struct {
	URL     string
	Artwork string
}

func (c *SpotifyClient) GetSummaryTrackArt(pagedTracks []summary.ScoredEntry) ([]summary.ScoredEntry, error) {

	trackURIs := make([]string, len(pagedTracks))
	for i, t := range pagedTracks {
		trackURIs[i] = t.URI
	}

	data, err := c.getSeveralTracksData(trackURIs)
	if err != nil {
		return pagedTracks, err
	}

	meta := make(map[string]trackInfo, len(data))
	for _, item := range data {
		var artURL string
		if len(item.Album.Images) > 0 {
			artURL = item.Album.Images[0].URL
		}

		meta[item.URI] = trackInfo{
			URL:     item.ExternalUrls.Spotify,
			Artwork: artURL,
		}
	}

	returnTracks := make([]summary.ScoredEntry, len(pagedTracks))
	for i, entry := range pagedTracks {
		info := meta[entry.URI]

		returnTracks[i] = summary.ScoredEntry{
			Name:       entry.Name,
			TotalMs:    entry.TotalMs,
			Count:      entry.Count,
			URI:        entry.URI,
			SpotifyURL: info.URL,
			ArtworkURL: info.Artwork,
		}
	}

	return returnTracks, nil

}

func (c *SpotifyClient) GetSummaryArtistArtAndID(pagedArtists []summary.ScoredEntry) ([]summary.ScoredEntry, error) {

	trackURIs := make([]string, len(pagedArtists))
	for i, t := range pagedArtists {
		trackURIs[i] = t.URI
	}

	nameToTrack := make(map[string]string)
	for _, e := range pagedArtists {
		nameToTrack[e.Name] = e.URI

	}

	trackData, err := c.getSeveralTracksData(trackURIs)
	if err != nil {
		return pagedArtists, err
	}

	artistURIs := make([]string, 0, len(trackData))
	trackForArtist := make(map[string]string)

	for _, track := range trackData {
		for _, artist := range track.Artists {
			if track.URI == nameToTrack[artist.Name] {
				artistURIs = append(artistURIs, artist.URI)
				trackForArtist[artist.URI] = track.URI
				break
			}
		}
	}

	if len(artistURIs) == 0 {
		slog.Warn("no artist URIs found")
	}

	artistData, err := c.getSeveralArtistsData(artistURIs)
	if err != nil {
		slog.Error("couldnt get several artist data", "err", err)
		return pagedArtists, err
	}

	meta := make(map[string]trackInfo, len(artistData))
	for _, a := range artistData {
		var artURl string
		if len(a.Images) > 0 {
			artURl = a.Images[0].URL
		}

		meta[a.URI] = trackInfo{
			URL:     a.ExternalUrls.Spotify,
			Artwork: artURl,
		}

	}

	returnArtists := make([]summary.ScoredEntry, len(pagedArtists))
	for i, e := range pagedArtists {
		trackURI := e.URI
		var artistURI string
		for aURI, tURI := range trackForArtist {
			if tURI == trackURI {
				artistURI = aURI
				break
			}
		}
		if artistURI == "" {
			returnArtists[i] = summary.ScoredEntry{
				Name:       e.Name,
				TotalMs:    e.TotalMs,
				Count:      e.Count,
				URI:        e.URI,
				SpotifyURL: e.SpotifyURL,
				ArtworkURL: e.ArtworkURL,
			}
			continue
		}
		info := meta[artistURI]

		returnArtists[i] = summary.ScoredEntry{
			Name:       e.Name,
			TotalMs:    e.TotalMs,
			Count:      e.Count,
			URI:        artistURI,
			SpotifyURL: info.URL,
			ArtworkURL: info.Artwork,
		}
	}
	return returnArtists, nil
}

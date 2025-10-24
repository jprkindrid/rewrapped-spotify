package spotify

import (
	"log/slog"
	"strings"

	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
)

type MetaInfo struct {
	ItemURL  string
	ImageURL string
}

func (c *SpotifyClient) GetSummaryTrackMetaData(pagedTracks []summary.ScoredEntry) ([]MetaInfo, error) {

	trackURIs := make([]string, len(pagedTracks))
	for i, t := range pagedTracks {
		trackURIs[i] = t.URI
	}

	data, err := c.getSeveralTracksData(trackURIs)
	if err != nil {
		return nil, err
	}

	meta := make([]MetaInfo, len(data))
	for i, item := range data {
		var artURL string
		if len(item.Album.Images) > 0 {
			artURL = item.Album.Images[0].URL
		}

		meta[i] = MetaInfo{
			ItemURL:  item.ExternalUrls.Spotify,
			ImageURL: artURL,
		}
	}

	return meta, nil

}

func (c *SpotifyClient) GetSummaryArtistMetaData(pagedArtists []summary.ScoredEntry) ([]MetaInfo, error) {

	trackURIs := make([]string, len(pagedArtists))
	for i, t := range pagedArtists {
		trackURIs[i] = t.URI
	}

	trackData, err := c.getSeveralTracksData(trackURIs)
	if err != nil {
		return nil, err
	}

	trackByUri := make(map[string]Track, len(trackData))
	for _, t := range trackData {
		trackByUri[t.URI] = t
	}

	artistURIs := make([]string, len(trackData))
	for i, entry := range pagedArtists {
		t, ok := trackByUri[entry.URI]
		if !ok {
			slog.Warn("missing track data for artist entry", "trackURI", entry.URI)
			continue
		}
		matchFound := false
		for _, artist := range t.Artists {

			if strings.EqualFold(artist.Name, entry.Name) {
				slog.Info("found matching artist", "uri", artist.URI)
				artistURIs[i] = artist.URI
				matchFound = true
				break
			}
		}
		if !matchFound && len(t.Artists) > 0 {
			slog.Debug("artist name not found in track, fallback to first artist", "entryName", entry.Name)
			artistURIs[i] = t.Artists[0].URI
		}
	}

	if len(artistURIs) == 0 {
		slog.Warn("no artist URIs found")
		return nil, err
	}

	artistData, err := c.getSeveralArtistsData(artistURIs)
	if err != nil {
		slog.Error("couldnt get several artist data", "err", err)
		return nil, err
	}

	meta := make([]MetaInfo, len(artistData))
	for i, a := range artistData {
		var artURl string
		if len(a.Images) > 0 {
			artURl = a.Images[0].URL
		}

		meta[i] = MetaInfo{
			ItemURL:  a.ExternalUrls.Spotify,
			ImageURL: artURl,
		}

	}

	return meta, nil
}

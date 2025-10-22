package spotify

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
)

func (c *SpotifyClient) getTrackData(trackURI string) (*Track, error) {

	token, err := c.GetValidToken()
	if err != nil {
		return nil, err
	}

	trackID := getID(trackURI)

	url := fmt.Sprintf("https://api.spotify.com/v1/tracks/%s", trackID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	slog.Info("making spotify request", "url", url)
	resp, err := c.doWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("error getting track data: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		slog.Error("spotify non-200 response",
			"status", resp.StatusCode,
			"body", string(body))
		return nil, fmt.Errorf("spotify API error: %d - %s",
			resp.StatusCode, string(body))
	}

	var track Track
	err = json.Unmarshal(body, &track)
	if err != nil {
		return nil, err
	}

	return &track, nil
}

func (c *SpotifyClient) getSeveralTracksData(trackURIs []string) ([]Track, error) {

	token, err := c.GetValidToken()
	if err != nil {
		return nil, err
	}
	var trackIDs []string
	for _, trackURI := range trackURIs {
		trackID := getID(trackURI)
		trackIDs = append(trackIDs, trackID)
	}

	trackIDsString := strings.Join(trackIDs, ",")

	url := fmt.Sprintf("https://api.spotify.com/v1/tracks?ids=%s", trackIDsString)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	// shortUrl := url[0:46]
	slog.Info("making spotify request", "url", url)
	resp, err := c.doWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("error getting track data: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		slog.Error("spotify non-200 response",
			"status", resp.StatusCode,
			"body", string(body))
		return nil, fmt.Errorf("spotify API error: %d - %s",
			resp.StatusCode, string(body))
	}

	var tracks MultiTrack
	err = json.Unmarshal(body, &tracks)
	if err != nil {
		return nil, err
	}

	returnTracks := tracks.ToTracks()

	return returnTracks, nil
}

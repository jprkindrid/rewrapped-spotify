package spotify

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
)

// I dont know why i did this firstbut this and clientToken.go are for later when I implement artist images and such into the pages

func (c *SpotifyClient) GetArtistData(artistURI string) (*Artist, error) {

	token, err := c.GetValidToken()
	if err != nil {
		return nil, err
	}

	artistID := getID(artistURI)

	url := fmt.Sprintf("https://api.spotify.com/v1/artists/%s", artistID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	slog.Info("making spotify request", "url", url)
	resp, err := c.doWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("error getting artist data: %w", err)
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

	var artist Artist
	err = json.Unmarshal(body, &artist)
	if err != nil {
		return nil, err
	}

	return &artist, nil
}

func (c *SpotifyClient) GetTrackData(trackURI string) (*Track, error) {

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

func (c *SpotifyClient) GetSeveralTracksData(trackURIs []string) ([]Track, error) {

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

func getID(itemURI string) string {
	parts := strings.Split(itemURI, ":")
	if len(parts) < 3 {
		slog.Warn("unexpected spotify URI format", "uri", itemURI)
		return itemURI
	}
	return parts[2]

}

package spotify

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
)

func (c *SpotifyClient) getArtistData(artistURI string) (*Artist, error) {

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

func (c *SpotifyClient) getSeveralArtistsData(artistURIs []string) ([]Artist, error) {

	token, err := c.GetValidToken()
	if err != nil {
		return nil, err
	}
	var artistIDs []string
	for _, artistURI := range artistURIs {
		artistID := getID(artistURI)
		artistIDs = append(artistIDs, artistID)
	}

	artistIDsString := strings.Join(artistIDs, ",")

	url := fmt.Sprintf("https://api.spotify.com/v1/artists?ids=%s", artistIDsString)
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

	var artists MultiArtist
	err = json.Unmarshal(body, &artists)
	if err != nil {
		return nil, err
	}

	returnArtists := artists.ToArtists()

	return returnArtists, nil
}

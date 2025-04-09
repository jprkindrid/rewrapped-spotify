package spotify

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

type CachedToken struct {
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
}

type Artist struct {
	ExternalUrls struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
	Followers struct {
		Href  any `json:"href"`
		Total int `json:"total"`
	} `json:"followers"`
	Genres []string `json:"genres"`
	Href   string   `json:"href"`
	ID     string   `json:"id"`
	Images []struct {
		Height int    `json:"height"`
		URL    string `json:"url"`
		Width  int    `json:"width"`
	} `json:"images"`
	Name       string `json:"name"`
	Popularity int    `json:"popularity"`
	Type       string `json:"type"`
	URI        string `json:"uri"`
}

func GetAccessToken(clientID, clientSecret string) (*CachedToken, error) {
	data := url.Values{}
	data.Set("grant_type", "client_credentials")

	reader := bytes.NewBufferString(data.Encode())
	req, err := http.NewRequest("POST", "https://accounts.spotify.com/api/token", reader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	authStr := clientID + ":" + clientSecret
	encodedAuthStr := base64.StdEncoding.EncodeToString([]byte(authStr))
	req.Header.Set("Authorization", "Basic "+encodedAuthStr)

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get token (status %d): %s", resp.StatusCode, body)
	}

	var tokenResponse TokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return nil, err
	}

	expiresAt := time.Now().Add(time.Duration(tokenResponse.ExpiresIn-60) * time.Second)
	cachedToken := CachedToken{
		AccessToken: tokenResponse.AccessToken,
		ExpiresAt:   expiresAt,
	}

	jsonData, err := json.MarshalIndent(cachedToken, "", " ")
	if err != nil {
		return nil, err
	}

	err = os.WriteFile("token_cache.json", jsonData, 0644)
	if err != nil {
		return nil, err
	}

	return &cachedToken, nil
}

func LoadCachedToken(path string) (*CachedToken, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var token CachedToken
	err = json.Unmarshal(data, &token)
	if err != nil {
		return nil, err
	}

	return &token, nil
}

func GetArtistData(token, artistID string) (*Artist, error) {
	url := fmt.Sprintf("https://api.spotify.com/v1/artists/%s", artistID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error getting artist data %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var artist Artist
	fmt.Println("Raw JSON:", string(body))
	fmt.Println()
	err = json.Unmarshal(body, &artist)
	if err != nil {
		return nil, err
	}

	return &artist, nil
}

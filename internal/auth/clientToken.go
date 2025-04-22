package auth

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sync"
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

var (
	appToken   *CachedToken
	appTokenMU sync.RWMutex
)

// Use the session store to cache tokens
func GetAPIToken() (string, error) {
	spotifyClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	spotifyClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	if spotifyClientID == "" || spotifyClientSecret == "" {
		return "", fmt.Errorf("missing client credentials")
	}

	appTokenMU.RLock()
	token := appToken
	appTokenMU.RUnlock()

	if token != nil && time.Now().Before(token.ExpiresAt.Add(-1*time.Minute)) {
		return token.AccessToken, nil
	}

	newToken, err := getAccessToken(spotifyClientID, spotifyClientSecret)
	if err != nil {
		return "", fmt.Errorf("failed to get access token: %v", err)
	}

	if newToken == nil || newToken.AccessToken == "" {
		return "", fmt.Errorf("received empty access token")
	}

	appTokenMU.Lock()
	appToken = newToken
	appTokenMU.Unlock()

	return newToken.AccessToken, nil
}

func getAccessToken(clientID, clientSecret string) (*CachedToken, error) {
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

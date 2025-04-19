package spotify

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
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

func GetValidToken() (string, error) {

	devClientID := os.Getenv("DEV_CLIENT_ID")
	devClientSecret := os.Getenv("DEV_CLIENT_SECRET")
	if devClientID == "" || devClientSecret == "" {
		return "", fmt.Errorf("missing client credentials")
	}
	appTokenMU.RLock()
	token := appToken
	appTokenMU.RUnlock()

	if token != nil && time.Now().After(token.ExpiresAt.Add(-1*time.Minute)) {
		fmt.Println("using cached token")
		return token.AccessToken, nil
	}

	fmt.Println("No valid access token found, fetching new token...")
	newToken, err := GetAccessToken(devClientID, devClientSecret)
	if err != nil {
		log.Fatalf("Failed to get access token: %v", err)
		return "", err
	}

	if token.AccessToken == "" {
		return "", fmt.Errorf("received empty access token")
	}

	appTokenMU.Lock()
	appToken = newToken
	appTokenMU.Unlock()

	return newToken.AccessToken, nil
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

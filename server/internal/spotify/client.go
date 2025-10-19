package spotify

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/joho/godotenv"
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

type SpotifyClient struct {
	clientID     string
	clientSecret string
	mu           sync.RWMutex
	appToken     *CachedToken
}

var (
	spotifyClient *SpotifyClient
)

func Init() error {
	clientID := os.Getenv("SPOTIFY_CLIENT_ID")
	clientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	if clientID == "" || clientSecret == "" {
		return fmt.Errorf("missing client credentials")
	}

	slog.Info("initializing spotify client")
	spotifyClient = &SpotifyClient{
		clientID:     clientID,
		clientSecret: clientSecret,
	}

	return nil
}

func GetClient() *SpotifyClient {
	if spotifyClient == nil {
		Init()
	}
	return spotifyClient
}

func (c *SpotifyClient) GetValidToken() (string, error) {
	c.mu.RLock()
	token := c.appToken
	c.mu.RUnlock()

	if token != nil && time.Now().Before(token.ExpiresAt.Add(-1*time.Minute)) {
		fmt.Println("using cached token")
		return token.AccessToken, nil
	}

	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load()
	}
	devClientID := os.Getenv("SPOTIFY_CLIENT_ID")
	devClientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	if devClientID == "" || devClientSecret == "" {
		return "", fmt.Errorf("missing client credentials")
	}

	slog.Info("No valid access token found, fetching new token...")
	newToken, err := c.getAccessToken(devClientID, devClientSecret)
	if err != nil {
		log.Fatalf("Failed to get access token: %v", err)
		return "", err
	}

	if newToken.AccessToken == "" {
		return "", fmt.Errorf("received empty access token")
	}

	c.mu.Lock()
	c.appToken = newToken
	c.mu.Unlock()

	return newToken.AccessToken, nil
}

func (c *SpotifyClient) getAccessToken(clientID, clientSecret string) (*CachedToken, error) {
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

	return &cachedToken, nil
}

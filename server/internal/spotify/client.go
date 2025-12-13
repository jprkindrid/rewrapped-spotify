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
	"strconv"
	"sync"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
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
	HTTP         *http.Client
}

var (
	spotifyClient *SpotifyClient
)

func Init(cfg *config.Config) error {
	slog.Info("initializing spotify client")
	spotifyClient = &SpotifyClient{
		clientID:     cfg.Spotify.ClientID,
		clientSecret: cfg.Spotify.Secret,
		HTTP:         &http.Client{Timeout: cfg.Time.HTTPClientTimeout},
	}

	return nil
}

func GetClient(cfg *config.Config) *SpotifyClient {
	if spotifyClient == nil {
		Init(cfg)
	}
	return spotifyClient
}

func (c *SpotifyClient) GetValidToken() (string, error) {
	c.mu.RLock()
	token := c.appToken
	c.mu.RUnlock()

	if token != nil && time.Now().Before(token.ExpiresAt.Add(-1*time.Minute)) {
		return token.AccessToken, nil
	}

	newToken, err := c.getAccessToken(c.clientID, c.clientSecret)
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

	resp, err := c.HTTP.Do(req)
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

func (c *SpotifyClient) doWithRetry(req *http.Request) (*http.Response, error) {
	client := c.HTTP
	if client == nil {
		client = &http.Client{}
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		retryAfter := 5 * time.Second
		if v := resp.Header.Get("Retry-After"); v != "" {
			if secs, err := strconv.Atoi(v); err == nil {
				retryAfter = time.Duration(secs) * time.Second
			}
		}
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		fmt.Printf("Rate limited by Spotify — retrying in %v (body: %s)\n", retryAfter, string(body))
		time.Sleep(retryAfter)

		return client.Do(req)
	}

	return resp, nil
}

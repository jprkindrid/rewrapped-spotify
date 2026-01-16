package cache

import (
	"sync"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type cachedData struct {
	Data      []parser.MinifiedSongData
	ExpiresAt time.Time
}

type UserDataCache struct {
	mu    sync.Mutex
	store map[string]cachedData
	ttl   time.Duration
}

func NewUserDataCache(ttl time.Duration) *UserDataCache {
	return &UserDataCache{
		store: make(map[string]cachedData),
		ttl:   ttl,
	}
}

func (c *UserDataCache) Get(spotifyID string) ([]parser.MinifiedSongData, bool) {
	cached, ok := c.store[spotifyID]
	if !ok || time.Now().After(cached.ExpiresAt) {
		return nil, false
	}
	return cached.Data, true
}

func (c *UserDataCache) Set(spotifyId string, data []parser.MinifiedSongData) {
	c.store[spotifyId] = cachedData{
		Data:      data,
		ExpiresAt: time.Now().Add(c.ttl),
	}
}

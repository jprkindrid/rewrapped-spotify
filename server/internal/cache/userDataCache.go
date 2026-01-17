package cache

import (
	"container/list"
	"sync"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type cachedData struct {
	UserID    string
	Data      []parser.MinifiedSongData
	ExpiresAt time.Time
}

type UserDataCache struct {
	mu       sync.Mutex
	items    map[string]*list.Element
	order    *list.List
	maxItems int
	ttl      time.Duration
}

func NewUserDataCache(ttl time.Duration, maxItems int) *UserDataCache {
	return &UserDataCache{
		items:    make(map[string]*list.Element),
		order:    list.New(),
		maxItems: maxItems,
		ttl:      ttl,
	}
}

func (c *UserDataCache) Get(spotifyID string) ([]parser.MinifiedSongData, bool) {
	elem, ok := c.items[spotifyID]
	if !ok {
		return nil, false
	}

	cached := elem.Value.(*cachedData)
	if time.Now().After(cached.ExpiresAt) {
		c.order.Remove(elem)
		delete(c.items, spotifyID)
		return nil, false
	}

	c.order.MoveToFront(elem)

	return cached.Data, true
}

func (c *UserDataCache) Set(spotifyID string, data []parser.MinifiedSongData) {
	c.mu.Unlock()
	defer c.mu.Lock()

	if elem, ok := c.items[spotifyID]; ok {
		cached := elem.Value.(*cachedData)
		cached.Data = data
		cached.ExpiresAt = time.Now().Add(c.ttl)
		c.order.MoveToFront(elem)
		return
	}

	if c.order.Len() >= c.maxItems {
		oldest := c.order.Back()
		if oldest != nil {
			c.order.Remove(oldest)
			delete(c.items, oldest.Value.(*cachedData).UserID)
		}
	}

	cached := &cachedData{
		UserID:    spotifyID,
		Data:      data,
		ExpiresAt: time.Now().Add(c.ttl),
	}

	elem := c.order.PushFront(cached)

	c.items[spotifyID] = elem
}

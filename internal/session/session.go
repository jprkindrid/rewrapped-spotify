package session

import (
	"log"
	"sync"

	"github.com/kindiregg/spotify-data-analyzer/internal/parser"
)

var (
	mu   sync.RWMutex
	data []parser.UserSongData
)

func Store(newData []parser.UserSongData) {
	mu.Lock()
	defer mu.Unlock()
	data = newData
	log.Printf("Successfully stored data in session")
}

func Get() []parser.UserSongData {
	mu.RLock()
	defer mu.RUnlock()
	return data
}

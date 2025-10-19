package authcode

import (
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"
)

type entry struct {
	UserID string
	Name   string
	Expiry time.Time
}

type Store struct {
	mu     sync.Mutex
	codes  map[string]entry
	expiry time.Duration
}

func NewStore(expiryTime time.Duration) *Store {
	return &Store{
		codes:  make(map[string]entry),
		expiry: expiryTime,
	}
}

func (s *Store) GenerateCodes(userID, displayName string) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	code := base64.RawURLEncoding.EncodeToString(b)

	s.mu.Lock()
	defer s.mu.Unlock()
	s.codes[code] = entry{
		UserID: userID,
		Name:   displayName,
		Expiry: time.Now().Add(s.expiry),
	}
	return code, nil
}

func (s *Store) ValidateAndDeleteCode(code string) (string, string, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	e, ok := s.codes[code]

	if !ok {
		return "", "", false
	}

	if time.Now().After(e.Expiry) {
		delete(s.codes, code)
		return "", "", false
	}

	delete(s.codes, code)
	return e.UserID, e.Name, true
}

func (s *Store) CleanExpired() {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for k, v := range s.codes {
		if now.After(v.Expiry) {
			delete(s.codes, k)
		}
	}
}

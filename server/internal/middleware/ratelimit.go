package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

type window struct {
	count   int
	resetAt time.Time
}

// RateLimiter allows a fixed number of requests per client IP per window. It's
// in memory, so limits reset when the machine restarts; it's meant to stop
// casual abuse of the endpoints that send email or create guests, not to be a
// hard quota.
type RateLimiter struct {
	limit  int
	period time.Duration
	mu     sync.Mutex
	hits   map[string]*window
}

func NewRateLimiter(limit int, period time.Duration) *RateLimiter {
	return &RateLimiter{limit: limit, period: period, hits: make(map[string]*window)}
}

func (l *RateLimiter) Allow(key string) bool {
	now := time.Now()

	l.mu.Lock()
	defer l.mu.Unlock()

	if len(l.hits) > 10_000 {
		for k, w := range l.hits {
			if now.After(w.resetAt) {
				delete(l.hits, k)
			}
		}
	}

	w, ok := l.hits[key]
	if !ok || now.After(w.resetAt) {
		l.hits[key] = &window{count: 1, resetAt: now.Add(l.period)}
		return true
	}
	if w.count >= l.limit {
		return false
	}
	w.count++
	return true
}

func (l *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.Allow(ClientIP(r)) {
			utils.RespondWithError(w, http.StatusTooManyRequests, "too many requests, try again later", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ClientIP prefers Fly's Fly-Client-IP header, which its proxy sets and
// clients can't spoof, then falls back to the connection's address.
func ClientIP(r *http.Request) string {
	if ip := strings.TrimSpace(r.Header.Get("Fly-Client-IP")); ip != "" {
		return ip
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

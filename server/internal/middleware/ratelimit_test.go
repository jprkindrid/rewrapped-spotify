package middleware

import (
	"net/http/httptest"
	"testing"
	"time"
)

func TestRateLimiter(t *testing.T) {
	l := NewRateLimiter(2, 50*time.Millisecond)

	if !l.Allow("a") || !l.Allow("a") {
		t.Fatal("first two requests should pass")
	}
	if l.Allow("a") {
		t.Fatal("third request in the window should be limited")
	}
	if !l.Allow("b") {
		t.Fatal("limits are per key")
	}

	time.Sleep(60 * time.Millisecond)
	if !l.Allow("a") {
		t.Fatal("limit should reset after the window")
	}
}

func TestClientIP(t *testing.T) {
	tests := []struct {
		name   string
		header string
		remote string
		want   string
	}{
		{"fly header wins", "203.0.113.7", "10.0.0.1:1234", "203.0.113.7"},
		{"falls back to connection", "", "198.51.100.2:5555", "198.51.100.2"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest("POST", "/", nil)
			r.RemoteAddr = tt.remote
			if tt.header != "" {
				r.Header.Set("Fly-Client-IP", tt.header)
			}
			if got := ClientIP(r); got != tt.want {
				t.Errorf("ClientIP() = %q, want %q", got, tt.want)
			}
		})
	}
}

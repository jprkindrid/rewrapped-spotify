package auth

import (
	"database/sql"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

func testConfig() *config.Config {
	return &config.Config{
		Auth: &config.AuthConfig{JWTSecret: "test-secret"},
		Time: &config.TimeConfig{SessionExpiry: 30 * 24 * time.Hour},
	}
}

func TestSessionTokenRoundTrip(t *testing.T) {
	cfg := testConfig()
	guestExpiry := time.Now().Add(7 * 24 * time.Hour).UTC().Truncate(time.Second)

	tests := []struct {
		name       string
		user       database.User
		opts       SessionOptions
		wantExpiry time.Duration // approximate, from now
		wantClaims SessionClaims
	}{
		{
			name: "account with password",
			user: database.User{
				ID:           "user-1",
				Email:        sql.NullString{String: "a@example.com", Valid: true},
				PasswordHash: sql.NullString{String: "hash", Valid: true},
				TokenVersion: 3,
			},
			wantExpiry: cfg.Time.SessionExpiry,
			wantClaims: SessionClaims{DisplayName: "a@example.com", Version: 3, HasPassword: true},
		},
		{
			name:       "guest expires with its data",
			user:       database.User{ID: "guest-1", IsGuest: true, GuestExpiresAt: sql.NullTime{Time: guestExpiry, Valid: true}},
			wantExpiry: 7 * 24 * time.Hour,
			wantClaims: SessionClaims{DisplayName: "Guest", Guest: true},
		},
		{
			name: "password reset session is short",
			user: database.User{
				ID:    "user-2",
				Email: sql.NullString{String: "b@example.com", Valid: true},
			},
			opts:       SessionOptions{PasswordReset: true},
			wantExpiry: PasswordResetSessionExpiry,
			wantClaims: SessionClaims{DisplayName: "b@example.com", PasswordReset: true},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := GenerateSessionToken(tt.user, cfg, tt.opts)
			if err != nil {
				t.Fatalf("generate: %v", err)
			}

			claims, err := ParseSessionToken(token, cfg.Auth.JWTSecretBytes())
			if err != nil {
				t.Fatalf("parse: %v", err)
			}

			if claims.Subject != tt.user.ID {
				t.Errorf("subject = %q, want user id %q", claims.Subject, tt.user.ID)
			}
			if claims.DisplayName != tt.wantClaims.DisplayName ||
				claims.Version != tt.wantClaims.Version ||
				claims.Guest != tt.wantClaims.Guest ||
				claims.HasPassword != tt.wantClaims.HasPassword ||
				claims.PasswordReset != tt.wantClaims.PasswordReset {
				t.Errorf("claims = %+v, want %+v", *claims, tt.wantClaims)
			}

			gotExpiry := time.Until(claims.ExpiresAt.Time)
			if diff := gotExpiry - tt.wantExpiry; diff > time.Minute || diff < -time.Minute {
				t.Errorf("expires in %v, want about %v", gotExpiry, tt.wantExpiry)
			}
		})
	}
}

func TestParseSessionTokenRejects(t *testing.T) {
	secret := []byte("test-secret")
	now := time.Now()

	sign := func(method jwt.SigningMethod, key any, claims jwt.Claims) string {
		t.Helper()
		s, err := jwt.NewWithClaims(method, claims).SignedString(key)
		if err != nil {
			t.Fatalf("sign: %v", err)
		}
		return s
	}

	valid := jwt.RegisteredClaims{
		Subject:   "user-1",
		Issuer:    issuer,
		ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour)),
	}

	tests := []struct {
		name  string
		token string
	}{
		{"wrong secret", sign(jwt.SigningMethodHS256, []byte("other"), valid)},
		{"wrong algorithm", sign(jwt.SigningMethodHS512, secret, valid)},
		{"unsigned", sign(jwt.SigningMethodNone, jwt.UnsafeAllowNoneSignatureType, valid)},
		{"expired", sign(jwt.SigningMethodHS256, secret, jwt.RegisteredClaims{
			Subject: "user-1", Issuer: issuer, ExpiresAt: jwt.NewNumericDate(now.Add(-time.Minute)),
		})},
		{"no expiry", sign(jwt.SigningMethodHS256, secret, jwt.RegisteredClaims{Subject: "user-1", Issuer: issuer})},
		{"wrong issuer", sign(jwt.SigningMethodHS256, secret, jwt.RegisteredClaims{
			Subject: "user-1", Issuer: "someone-else", ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour)),
		})},
		{"no subject", sign(jwt.SigningMethodHS256, secret, jwt.RegisteredClaims{
			Issuer: issuer, ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour)),
		})},
		{"garbage", "not.a.token"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := ParseSessionToken(tt.token, secret); err == nil {
				t.Fatal("expected token to be rejected")
			}
		})
	}
}

func TestDisplayName(t *testing.T) {
	tests := []struct {
		name string
		user database.User
		want string
	}{
		{"display name wins", database.User{
			DisplayName: sql.NullString{String: "  Kindrid ", Valid: true},
			Email:       sql.NullString{String: "k@example.com", Valid: true},
		}, "Kindrid"},
		{"falls back to email", database.User{Email: sql.NullString{String: "k@example.com", Valid: true}}, "k@example.com"},
		{"blank name falls back", database.User{
			DisplayName: sql.NullString{String: "  ", Valid: true},
			Email:       sql.NullString{String: "k@example.com", Valid: true},
		}, "k@example.com"},
		{"guest", database.User{IsGuest: true}, "Guest"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := DisplayName(tt.user); got != tt.want {
				t.Errorf("DisplayName() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestEmailTokenHashing(t *testing.T) {
	raw, hash, err := NewEmailToken()
	if err != nil {
		t.Fatal(err)
	}
	if raw == hash {
		t.Fatal("stored hash must differ from the emailed token")
	}
	if HashEmailToken(raw) != hash {
		t.Fatal("hashing the emailed token must reproduce the stored hash")
	}
	other, _, _ := NewEmailToken()
	if other == raw {
		t.Fatal("tokens must be random")
	}
}

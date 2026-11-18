package auth

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

const (
	issuer = "api-rewrapped-spotify"

	// PasswordResetSessionExpiry is how long a session opened from a reset link
	// may be used to set a new password without knowing the old one.
	PasswordResetSessionExpiry = 15 * time.Minute

	guestDisplayName = "Guest"
)

// SessionClaims is the payload of a session token. The subject is the user's
// id, never their email, so changing email doesn't change identity.
type SessionClaims struct {
	DisplayName string `json:"display_name,omitempty"`
	// Version must match users.token_version; bumping it revokes the token.
	Version     int64 `json:"ver"`
	Guest       bool  `json:"guest,omitempty"`
	HasPassword bool  `json:"has_password,omitempty"`
	// PasswordReset marks a short-lived session opened from a reset link.
	PasswordReset bool `json:"pwreset,omitempty"`
	jwt.RegisteredClaims
}

type SessionOptions struct {
	PasswordReset bool
}

// GenerateSessionToken issues a token for user. Guest tokens expire with the
// guest's data; account tokens last cfg.Time.SessionExpiry.
func GenerateSessionToken(user database.User, cfg *config.Config, opts SessionOptions) (string, error) {
	secret := cfg.Auth.JWTSecretBytes()
	if len(secret) == 0 {
		return "", fmt.Errorf("missing required JWT_SECRET in config")
	}

	now := time.Now().UTC()
	expiresAt := now.Add(cfg.Time.SessionExpiry)
	switch {
	case opts.PasswordReset:
		expiresAt = now.Add(PasswordResetSessionExpiry)
	case user.IsGuest && user.GuestExpiresAt.Valid:
		expiresAt = user.GuestExpiresAt.Time.UTC()
	}

	claims := SessionClaims{
		DisplayName:   DisplayName(user),
		Version:       user.TokenVersion,
		Guest:         user.IsGuest,
		HasPassword:   user.PasswordHash.Valid && user.PasswordHash.String != "",
		PasswordReset: opts.PasswordReset,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			Issuer:    issuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

// ParseSessionToken validates the signature, issuer and expiry of a session
// token. It does not check the token version; that needs the database.
func ParseSessionToken(tokenStr string, secret []byte) (*SessionClaims, error) {
	if len(secret) == 0 {
		return nil, fmt.Errorf("missing JWT secret")
	}

	claims := &SessionClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (any, error) {
		return secret, nil
	},
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithIssuer(issuer),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	if claims.Subject == "" {
		return nil, errors.New("token has no subject")
	}

	return claims, nil
}

// DisplayName is what the UI shows for user: their chosen name, else their
// email, else "Guest".
func DisplayName(user database.User) string {
	if user.DisplayName.Valid {
		if name := strings.TrimSpace(user.DisplayName.String); name != "" {
			return name
		}
	}
	if user.Email.Valid && user.Email.String != "" {
		return user.Email.String
	}
	return guestDisplayName
}

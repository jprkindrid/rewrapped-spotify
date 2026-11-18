package middleware

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

// sessionCheckTTL bounds how long a revoked session (password reset, deleted
// account) can keep working, in exchange for not hitting the database on
// every request.
const sessionCheckTTL = 30 * time.Second

type UserLookup interface {
	GetUserByID(ctx context.Context, id string) (database.User, error)
}

type sessionState struct {
	version   int64
	checkedAt time.Time
}

// SessionChecker verifies that a token's version is still the user's current
// one. It's shared with handlers so they can Invalidate a user immediately
// after revoking their sessions.
type SessionChecker struct {
	users UserLookup
	mu    sync.Mutex
	seen  map[string]sessionState
}

func NewSessionChecker(users UserLookup) *SessionChecker {
	return &SessionChecker{users: users, seen: make(map[string]sessionState)}
}

// Invalidate forgets the cached version for userID, so the next request
// re-reads it. Call after changing token_version or deleting the user.
func (s *SessionChecker) Invalidate(userID string) {
	s.mu.Lock()
	delete(s.seen, userID)
	s.mu.Unlock()
}

// currentVersion returns the user's token_version, or sql.ErrNoRows if the
// user no longer exists.
func (s *SessionChecker) currentVersion(ctx context.Context, userID string) (int64, error) {
	s.mu.Lock()
	state, ok := s.seen[userID]
	s.mu.Unlock()
	if ok && time.Since(state.checkedAt) < sessionCheckTTL {
		return state.version, nil
	}

	user, err := s.users.GetUserByID(ctx, userID)
	if err != nil {
		return 0, err
	}

	s.mu.Lock()
	if len(s.seen) > 10_000 {
		s.seen = make(map[string]sessionState)
	}
	s.seen[userID] = sessionState{version: user.TokenVersion, checkedAt: time.Now()}
	s.mu.Unlock()

	return user.TokenVersion, nil
}

// NewAuth returns middleware that requires a valid, unrevoked session token.
// It puts the user's id under constants.UserIDKey and the token's claims
// under constants.SessionKey.
func NewAuth(cfg *config.Config, checker *SessionChecker) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
			if !ok || tokenStr == "" {
				utils.RespondWithError(w, http.StatusUnauthorized, "missing authorization header", nil)
				return
			}

			claims, err := auth.ParseSessionToken(tokenStr, cfg.Auth.JWTSecretBytes())
			if err != nil {
				utils.RespondWithError(w, http.StatusUnauthorized, "invalid or expired token", err)
				return
			}

			version, err := checker.currentVersion(r.Context(), claims.Subject)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					utils.RespondWithError(w, http.StatusUnauthorized, "account no longer exists", err)
					return
				}
				utils.RespondWithError(w, http.StatusInternalServerError, "failed to check session", err)
				return
			}
			if version != claims.Version {
				utils.RespondWithError(w, http.StatusUnauthorized, "session has been signed out", fmt.Errorf("token version %d, current %d", claims.Version, version))
				return
			}

			ctx := context.WithValue(r.Context(), constants.UserIDKey, claims.Subject)
			ctx = context.WithValue(ctx, constants.SessionKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// SessionFromContext returns the claims NewAuth stored, if any.
func SessionFromContext(ctx context.Context) (*auth.SessionClaims, bool) {
	claims, ok := ctx.Value(constants.SessionKey).(*auth.SessionClaims)
	return claims, ok && claims != nil
}

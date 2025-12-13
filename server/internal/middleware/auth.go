package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func AuthMiddleware(cfg *config.Config, next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.RespondWithError(w, http.StatusUnauthorized, "missing authorization header", fmt.Errorf("missing authorization header"))
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims := jwt.MapClaims{}

		jwtSecret := cfg.JWTSecretBytes()
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (any, error) {
			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			utils.RespondWithError(w, http.StatusUnauthorized, "invalid or expired token", err)
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			utils.RespondWithError(w, http.StatusUnauthorized, "invalid payload token", fmt.Errorf("invalid payload token"))
			return
		}

		ctx := context.WithValue(r.Context(), constants.UserIDKey, userID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

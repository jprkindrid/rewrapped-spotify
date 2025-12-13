package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func DemoMiddleware(cfg *config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		expectedKey := cfg.DemoKey

		if r.Header.Get("X-Demo-Key") != expectedKey {
			utils.RespondWithError(w, http.StatusForbidden, "invalid demo key", fmt.Errorf("invalid demo key"))
			return
		}

		ctx := context.WithValue(r.Context(), constants.UserIDKey, cfg.DemoUserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

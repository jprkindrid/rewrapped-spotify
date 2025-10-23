package middleware

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func DemoMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		expectedKey := os.Getenv("DEMO_KEY")

		if r.Header.Get("X-Demo-Key") != expectedKey {
			utils.RespondWithError(w, http.StatusForbidden, "invalid demo key", fmt.Errorf("invalid demo key"))
			return
		}

		demoUserID := os.Getenv("KINDRID_USER_ID")
		ctx := context.WithValue(r.Context(), constants.UserIDKey, demoUserID)
		slog.Info("GETTING DEMO")
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

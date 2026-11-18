package server

import (
	"net/http"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
)

func RegisterRoutes(mux *http.ServeMux, cfg *handlers.ApiConfig) {
	authed := middleware.NewAuth(cfg.Env, cfg.Sessions)

	// Per-IP limits on endpoints that guess passwords, create rows, or send email.
	loginLimit := middleware.NewRateLimiter(20, 15*time.Minute).Middleware
	guestLimit := middleware.NewRateLimiter(10, time.Hour).Middleware
	emailLimit := middleware.NewRateLimiter(10, time.Hour).Middleware
	verifyLimit := middleware.NewRateLimiter(30, 15*time.Minute).Middleware

	mux.HandleFunc("GET /health", cfg.HandlerHealth)

	mux.HandleFunc("GET /auth/config", cfg.HandlerAuthConfig)
	mux.Handle("POST /auth/register", guestLimit(http.HandlerFunc(cfg.HandlerRegister)))
	mux.Handle("POST /auth/login", loginLimit(http.HandlerFunc(cfg.HandlerLogin)))
	mux.Handle("POST /auth/guest", guestLimit(http.HandlerFunc(cfg.HandlerGuest)))
	mux.Handle("POST /auth/email-link", emailLimit(http.HandlerFunc(cfg.HandlerEmailLink)))
	mux.Handle("POST /auth/verify", verifyLimit(http.HandlerFunc(cfg.HandlerVerifyEmailLink)))
	mux.Handle("POST /auth/refresh", authed(http.HandlerFunc(cfg.HandlerRefresh)))
	mux.Handle("POST /api/account/claim", emailLimit(authed(http.HandlerFunc(cfg.HandlerClaimGuest))))

	mux.Handle("POST /api/upload", authed(http.HandlerFunc(cfg.HandlerUpload)))

	mux.Handle("GET /api/summary", authed(http.HandlerFunc(cfg.HandlerSummary)))
	mux.Handle("GET /api/demo/summary", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummary)))

	mux.Handle("POST /api/summary/images", authed(http.HandlerFunc(cfg.HandlerSummaryImages)))
	mux.Handle("POST /api/demo/summary/images", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummaryImages)))
	mux.Handle("POST /api/summary/search", authed(http.HandlerFunc(cfg.HandlerSummarySearch)))
	mux.Handle("POST /api/demo/summary/search", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummarySearch)))

	mux.Handle("POST /api/demo/bumpchart", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerBumpChart)))
	mux.Handle("POST /api/bumpchart", authed(http.HandlerFunc(cfg.HandlerBumpChart)))

	mux.Handle("POST /api/listeningtime", authed(http.HandlerFunc(cfg.HandlerListeningTime)))
	mux.Handle("POST /api/demo/listeningtime", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerListeningTime)))

	mux.Handle("POST /api/listeningclock", authed(http.HandlerFunc(cfg.HandlerListeningClock)))
	mux.Handle("POST /api/demo/listeningclock", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerListeningClock)))

	mux.Handle("POST /api/discovery", authed(http.HandlerFunc(cfg.HandlerDiscovery)))
	mux.Handle("POST /api/demo/discovery", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiscovery)))

	mux.Handle("POST /api/discovery/search", authed(http.HandlerFunc(cfg.HandlerDiscoverySearch)))
	mux.Handle("POST /api/demo/discovery/search", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiscoverySearch)))

	mux.Handle("POST /api/diversity", authed(http.HandlerFunc(cfg.HandlerDiversity)))
	mux.Handle("POST /api/demo/diversity", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiversity)))

	mux.Handle("POST /api/streaks", authed(http.HandlerFunc(cfg.HandlerStreaks)))
	mux.Handle("POST /api/demo/streaks", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerStreaks)))

	mux.Handle("DELETE /api/delete", authed(http.HandlerFunc(cfg.HandlerDelete)))

	mux.Handle("PUT /api/account/email", authed(http.HandlerFunc(cfg.HandlerUpdateEmail)))
	mux.Handle("PUT /api/account/password", authed(http.HandlerFunc(cfg.HandlerUpdatePassword)))
	mux.Handle("PUT /api/account/display-name", authed(http.HandlerFunc(cfg.HandlerUpdateDisplayName)))
}

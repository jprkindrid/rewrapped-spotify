package server

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
)

func RegisterRoutes(mux *http.ServeMux, cfg *handlers.ApiConfig) {
	mux.HandleFunc("GET /health", cfg.HandlerHealth)

	mux.HandleFunc("POST /auth/register", cfg.HandlerRegister)
	mux.HandleFunc("POST /auth/login", cfg.HandlerLogin)

	mux.Handle("POST /api/upload", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerUpload)))

	mux.Handle("GET /api/summary", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummary)))
	mux.Handle("GET /api/demo/summary", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummary)))

	mux.Handle("POST /api/summary/images", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummaryImages)))
	mux.Handle("POST /api/demo/summary/images", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummaryImages)))

	mux.Handle("POST /api/demo/bumpchart", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerBumpChart)))
	mux.Handle("POST /api/bumpchart", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerBumpChart)))

	mux.Handle("POST /api/listeningtime", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerListeningTime)))
	mux.Handle("POST /api/demo/listeningtime", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerListeningTime)))

	mux.Handle("POST /api/listeningclock", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerListeningClock)))
	mux.Handle("POST /api/demo/listeningclock", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerListeningClock)))

	mux.Handle("POST /api/discovery", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiscovery)))
	mux.Handle("POST /api/demo/discovery", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiscovery)))

	mux.Handle("POST /api/discovery/search", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiscoverySearch)))
	mux.Handle("POST /api/demo/discovery/search", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiscoverySearch)))

	mux.Handle("POST /api/diversity", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiversity)))
	mux.Handle("POST /api/demo/diversity", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDiversity)))

	mux.Handle("POST /api/streaks", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerStreaks)))
	mux.Handle("POST /api/demo/streaks", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerStreaks)))

	// mux.Handle("POST /auth/logout", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerLogout))) // No longer needed for now
	mux.Handle("DELETE /api/delete", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDelete)))

	mux.Handle("PUT /api/account/email", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerUpdateEmail)))
	mux.Handle("PUT /api/account/password", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerUpdatePassword)))
	mux.Handle("PUT /api/account/display-name", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerUpdateDisplayName)))

}

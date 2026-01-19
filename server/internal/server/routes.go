package server

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
)

func RegisterRoutes(mux *http.ServeMux, cfg *handlers.ApiConfig) {
	mux.HandleFunc("GET /health", cfg.HandlerHealth)

	mux.HandleFunc("GET /auth/spotify/login", cfg.HandlerLogin)
	mux.HandleFunc("GET /auth/spotify/callback", cfg.HandlerCallback)
	mux.HandleFunc("POST /auth/exchange", cfg.HandlerExchange)

	mux.Handle("POST /api/upload", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerUpload)))

	mux.Handle("GET /api/summary", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummary)))
	mux.Handle("GET /api/demo/summary", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummary)))

	mux.Handle("POST /api/summary/images", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummaryImages)))
	mux.Handle("POST /api/demo/summary/images", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerSummaryImages)))

	mux.Handle("POST /api/demo/bumpchart", middleware.DemoMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerBumpChart)))
	mux.Handle("POST /api/bumpchart", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerBumpChart)))

	// mux.Handle("POST /auth/logout", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerLogout))) // No longer needed for now
	mux.Handle("DELETE /api/delete", middleware.AuthMiddleware(cfg.Env, http.HandlerFunc(cfg.HandlerDelete)))

}

package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/authcode"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	db "github.com/jprkindrid/rewrapped-spotify/internal/dbConn"
	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

func main() {

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	slog.SetDefault(logger)

	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load("./.env")
	}

	conn := db.Open()

	if err := conn.Ping(); err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	dbQueries := database.New(conn)

	cfg := &handlers.ApiConfig{
		DB:        dbQueries,
		AuthCodes: authcode.NewStore(60 * time.Second),
	}

	err := spotify.Init()
	if err != nil {
		log.Fatalf("error initializing spotify client: %v", err)
	}
	sClient := spotify.GetClient()
	_, err = sClient.GetValidToken()
	if err != nil {
		log.Fatalf("error initializing getting token: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// addr := "127.0.0.1:" + port
	// debugging
	addr := "0.0.0.0:8080"

	if os.Getenv("DOCKER") == "" {
		addr = "127.0.0.1:8080"
	}
	auth.NewAuth()
	storage.Init()

	mux := http.NewServeMux()

	//api
	mux.HandleFunc("GET /health", cfg.HandlerHealth)
	mux.HandleFunc("GET /auth/spotify/login", cfg.HandlerLogin)
	mux.HandleFunc("GET /auth/spotify/callback", cfg.HandlerCallback)
	mux.HandleFunc("POST /auth/exchange", cfg.HandlerExchange)
	mux.Handle("POST /api/upload", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerUpload)))
	mux.Handle("GET /api/summary", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerSummary)))
	mux.Handle("GET /api/demo/summary", middleware.DemoMiddleware(http.HandlerFunc(cfg.HandlerSummary)))
	// mux.Handle("POST /auth/logout", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerLogout))) // No longer needed for now
	mux.Handle("DELETE /api/delete", middleware.AuthMiddleware(http.HandlerFunc(cfg.HandlerDelete)))

	allowedOrigins := []string{"http://127.0.0.1:5173", " https://127.0.0.1:5173", "http://127.0.0.1:4173", " https://127.0.0.1:4173", " http://127.0.0.1:8080", "http://127.0.0.1:8080"}

	if os.Getenv("PRODUCTION_BUILD") == "TRUE" {
		allowedOrigins = []string{"https://rewrapped-spotify.pages.dev"}
	}

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	srv := http.Server{
		Handler:      corsHandler.Handler(mux),
		Addr:         addr,
		WriteTimeout: constants.HTTPWriteTimeout * time.Second,
		ReadTimeout:  constants.HTTPReadTimeout * time.Second,
	}

	log.Printf("Server running at http://%s\n", addr)

	log.Fatal(srv.ListenAndServe())
}

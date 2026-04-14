package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/jprkindrid/rewrapped-spotify/internal/cache"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	db "github.com/jprkindrid/rewrapped-spotify/internal/dbConn"
	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/server"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	slog.SetDefault(logger)

	if os.Getenv("DOCKER") == "" {
		_ = godotenv.Load("./.env")
	}

	envConfig := config.Init()

	conn := db.Open(envConfig)

	if err := conn.Ping(); err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	dbQueries := database.New(conn)

	cfg := &handlers.ApiConfig{
		DB:        dbQueries,
		Env:       envConfig,
		DataCache: cache.NewUserDataCache(envConfig.DataCache.ExpiryTime, envConfig.DataCache.MaxItems),
	}

	sClient := spotify.GetClient(cfg.Env)
	_, err := sClient.GetValidToken()
	if err != nil {
		log.Fatalf("error getting spotify client token: %v", err)
	}

	// addr := "127.0.0.1:" + port
	// debugging
	addr := "127.0.0.1:8080"

	if cfg.Env.Server.IsDocker {
		addr = "0.0.0.0:8080"
	}
	storage.Init(cfg.Env)

	mux := http.NewServeMux()

	server.RegisterRoutes(mux, cfg)
	corsHandler := server.NewCORSHandler(cfg.Env.Server.ProductionBuild)

	srv := http.Server{
		Handler:      corsHandler.Handler(mux),
		Addr:         addr,
		WriteTimeout: cfg.Env.Time.HTTPClientTimeout,
		ReadTimeout:  cfg.Env.Time.HTTPClientTimeout,
	}

	log.Printf("Server running at http://%s\n", addr)

	log.Fatal(srv.ListenAndServe())
}

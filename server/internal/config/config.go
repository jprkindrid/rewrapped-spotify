package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	// Auth
	JWTSecret     string
	SessionSecret string

	// Spotify API
	SpotifyClientID    string
	SpotifySecret      string
	SpotifyRedirectURI string

	// Database
	DatabaseURL  string
	DBPath       string
	DBPathDocker string
	TursoURL     string
	TursoToken   string

	// Storage
	StorageProvider      string
	CloudflareBucketName string
	CloudflareAccountID  string
	CloudflareKeyID      string
	CloudflareKeySecret  string

	// Server
	Port                string
	ProductionBuild     bool
	IsDocker            bool
	FrontendRedirectURL string

	// Demo
	DemoKey    string
	DemoUserID string

	// Timeouts & Limits
	AuthCodeExpiry    time.Duration
	JWTExpiry         time.Duration
	TokenExpiryBuffer time.Duration
	SpotifyRetryDelay time.Duration
	HTTPClientTimeout time.Duration
	MinPlayTimeMs     int
}

var globalConfig *Config

func Init() *Config {
	if os.Getenv("DOCKER") == "" {
		if err := godotenv.Load("./.env"); err != nil {
			log.Fatalf("Error loading .env file: %v", err)
		}
	}

	cfg := &Config{
		JWTSecret:            getEnvRequired("JWT_SECRET"),
		SessionSecret:        getEnvRequired("SESSION_SECRET"),
		SpotifyClientID:      getEnvRequired("SPOTIFY_CLIENT_ID"),
		SpotifySecret:        getEnvRequired("SPOTIFY_CLIENT_SECRET"),
		SpotifyRedirectURI:   getEnvRequired("SPOTIFY_REDIRECT_URI"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		DBPath:               os.Getenv("DB_PATH"),
		DBPathDocker:         os.Getenv("DB_PATH_DOCKER"),
		TursoURL:             os.Getenv("TURSO_DATABASE_URL"),
		TursoToken:           os.Getenv("TURSO_AUTH_TOKEN"),
		StorageProvider:      os.Getenv("STORAGE_PROVIDER"),
		CloudflareBucketName: getEnvRequired("CLOUDFLARE_BUCKET_NAME"),
		CloudflareAccountID:  getEnvRequired("CLOUDFLARE_ACCOUNT_ID"),
		CloudflareKeyID:      getEnvRequired("CLOUDFLARE_KEY_ID"),
		CloudflareKeySecret:  getEnvRequired("CLOUDFLARE_KEY_SECRET"),
		Port:                 getEnvOrDefault("PORT", "8080"),
		ProductionBuild:      os.Getenv("PRODUCTION_BUILD") == "TRUE",
		IsDocker:             os.Getenv("DOCKER") != "",
		FrontendRedirectURL:  getEnvRequired("FRONTEND_REDIRECT_URL"),
		DemoKey:              os.Getenv("DEMO_KEY"),
		DemoUserID:           os.Getenv("KINDRID_USER_ID"),

		// Time constants
		AuthCodeExpiry:    60 * time.Second,
		JWTExpiry:         time.Hour,
		TokenExpiryBuffer: 60 * time.Second,
		SpotifyRetryDelay: 5 * time.Second,
		HTTPClientTimeout: 30 * time.Second,
		MinPlayTimeMs:     30000, // 30 seconds
	}

	globalConfig = cfg
	return globalConfig
}

func Get() *Config {
	if globalConfig == nil {
		panic("configuration not initialized")
	}
	return globalConfig
}

func (c *Config) JWTSecretBytes() []byte {
	return []byte(c.JWTSecret)
}
func (c *Config) SessionSecretBytes() []byte {
	return []byte(c.SessionSecret)
}

func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvRequired(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}
	return val
}

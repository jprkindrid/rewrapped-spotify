package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type AuthConfig struct {
	JWTSecret string
}

type SpotifyConfig struct {
	ClientID   string
	Secret     string
	RetryDelay time.Duration
}

type DatabaseConfig struct {
	URL        string
	Path       string
	PathDocker string
	TursoURL   string
	TursoToken string
}

type StorageConfig struct {
	Provider   string
	BucketName string
	AccountID  string
	KeyID      string
	KeySecret  string
	Endpoint   string
}

type ServerConfig struct {
	Port            string
	ProductionBuild bool
	IsDocker        bool
}

type DemoConfig struct {
	Key    string
	UserID string
}

type TimeConfig struct {
	JWTExpiry         time.Duration
	TokenExpiryBuffer time.Duration
	HTTPClientTimeout time.Duration
	MinPlayTimeMs     int
}

type UserDataCacheConfig struct {
	ExpiryTime time.Duration
	MaxItems   int
}

type Config struct {
	Auth      *AuthConfig
	Spotify   *SpotifyConfig
	Database  *DatabaseConfig
	Storage   *StorageConfig
	Server    *ServerConfig
	Demo      *DemoConfig
	Time      *TimeConfig
	DataCache *UserDataCacheConfig
}

func Init() *Config {
	if os.Getenv("DOCKER") == "" {
		if err := godotenv.Load("./.env"); err != nil {
			log.Fatalf("Error loading .env file: %v", err)
		}
	}

	return &Config{
		Auth: &AuthConfig{
			JWTSecret: getEnvRequired("JWT_SECRET"),
		},
		Spotify: &SpotifyConfig{
			ClientID:   getEnvRequired("SPOTIFY_CLIENT_ID"),
			Secret:     getEnvRequired("SPOTIFY_CLIENT_SECRET"),
			RetryDelay: 5 * time.Second,
		},
		Database: &DatabaseConfig{
			URL:        os.Getenv("DATABASE_URL"),
			Path:       os.Getenv("DB_PATH"),
			PathDocker: os.Getenv("DB_PATH_DOCKER"),
			TursoURL:   os.Getenv("TURSO_DATABASE_URL"),
			TursoToken: os.Getenv("TURSO_AUTH_TOKEN"),
		},
		Storage: &StorageConfig{
			Provider:   os.Getenv("STORAGE_PROVIDER"),
			BucketName: getEnvRequired("CLOUDFLARE_BUCKET_NAME"),
			AccountID:  getEnvRequired("CLOUDFLARE_ACCOUNT_ID"),
			KeyID:      getEnvRequired("CLOUDFLARE_KEY_ID"),
			KeySecret:  getEnvRequired("CLOUDFLARE_KEY_SECRET"),
			Endpoint:   os.Getenv("STORAGE_ENDPOINT"),
		},
		Server: &ServerConfig{
			Port:            getEnvOrDefault("PORT", "8080"),
			ProductionBuild: os.Getenv("PRODUCTION_BUILD") == "TRUE",
			IsDocker:        os.Getenv("DOCKER") != "",
		},
		Demo: &DemoConfig{
			Key:    os.Getenv("DEMO_KEY"),
			UserID: os.Getenv("KINDRID_USER_ID"),
		},
		Time: &TimeConfig{
			JWTExpiry:         time.Hour,
			TokenExpiryBuffer: 60 * time.Second,
			HTTPClientTimeout: 30 * time.Second,
			MinPlayTimeMs:     30000,
		},
		DataCache: &UserDataCacheConfig{
			ExpiryTime: 30 * time.Minute,
			MaxItems:   25,
		},
	}
}

func (a *AuthConfig) JWTSecretBytes() []byte {
	return []byte(a.JWTSecret)
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

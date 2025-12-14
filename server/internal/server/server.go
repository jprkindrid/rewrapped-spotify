package server

import "github.com/rs/cors"

func NewCORSHandler(productionBuild bool) *cors.Cors {

	allowedOrigins := []string{"http://127.0.0.1:5173", "https://127.0.0.1:5173", "http://127.0.0.1:4173", "https://127.0.0.1:4173", " http://127.0.0.1:8080", "http://127.0.0.1:8080"}

	if productionBuild {
		allowedOrigins = []string{"https://rewrapped-spotify.pages.dev"}
	}

	return cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

}

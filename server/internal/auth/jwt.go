package auth

import (
	"log"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
)

func GenerateJWT(userID, displayName string) (string, error) {

	cfg := config.Get()
	jwtSecret := cfg.JWTSecretBytes()
	if len(jwtSecret) == 0 {
		log.Fatal("[AUTH] Missing required JWT_SECRET in config")
	}

	expiryTime := cfg.JWTExpiry

	claims := jwt.MapClaims{
		"sub":          userID,
		"display_name": displayName,
		"iss":          "api-rewrapped-spotify",
		"iat":          jwt.NewNumericDate(time.Now().UTC()),
		"exp":          jwt.NewNumericDate(time.Now().UTC().Add(expiryTime)),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

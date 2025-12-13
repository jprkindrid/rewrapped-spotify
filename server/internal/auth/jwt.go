package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
)

func GenerateJWT(userID, displayName string, cfg *config.Config) (string, error) {
	jwtSecret := cfg.Auth.JWTSecretBytes()
	if len(jwtSecret) == 0 {
		return "", fmt.Errorf("missing required JWT_SECRET in config")
	}

	claims := jwt.MapClaims{
		"sub":          userID,
		"display_name": displayName,
		"iss":          "api-rewrapped-spotify",
		"iat":          jwt.NewNumericDate(time.Now().UTC()),
		"exp":          jwt.NewNumericDate(time.Now().UTC().Add(cfg.Time.JWTExpiry)),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

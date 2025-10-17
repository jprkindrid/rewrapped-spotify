package auth

import (
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

func GenerateJWT(userID, displayName string) (string, error) {

	jwtSecretStr := os.Getenv("JWT_SECRET")
	if jwtSecretStr == "" {
		log.Fatal("[AUTH] Missing required environment variable JWT_SECRET")
	}

	jwtSecret := []byte(jwtSecretStr)

	expiryTime := time.Hour

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

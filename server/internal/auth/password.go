package auth

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(rawPassword string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func ComparePassword(hash, rawPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(rawPassword))
}

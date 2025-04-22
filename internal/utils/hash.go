package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashEmail creates a SHA-256 hash of an email address
func HashEmail(email string) string {
	hasher := sha256.New()
	hasher.Write([]byte(email))
	return hex.EncodeToString(hasher.Sum(nil))
}

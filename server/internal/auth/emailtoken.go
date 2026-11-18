package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
)

// Purposes of a one-time email link.
const (
	EmailPurposeLogin = "login" // sign in without a password
	EmailPurposeReset = "reset" // sign in, then set a new password
	EmailPurposeClaim = "claim" // confirm an email to keep a guest's data
)

// NewEmailToken returns a random token to put in an emailed link, and the hash
// to store. Only the hash is kept, so a database leak doesn't leak live links.
func NewEmailToken() (raw, hash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", fmt.Errorf("failed to generate token: %w", err)
	}
	raw = base64.RawURLEncoding.EncodeToString(b)
	return raw, HashEmailToken(raw), nil
}

func HashEmailToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

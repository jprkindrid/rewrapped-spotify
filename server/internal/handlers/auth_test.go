package handlers

import (
	"database/sql"
	"testing"

	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

func TestValidateLoginInput(t *testing.T) {
	tests := []struct {
		name        string
		email       string
		password    string
		expectError bool
	}{
		{
			name:        "valid input",
			email:       "kindrid@example.com",
			password:    "password123",
			expectError: false,
		},
		{
			name:        "missing email",
			email:       "",
			password:    "password123",
			expectError: true,
		},
		{
			name:        "missing password",
			email:       "kindrid@example.com",
			password:    "",
			expectError: true,
		},
		{
			name:        "invalid email",
			email:       "not-an-email",
			password:    "password123",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateLoginInput(tt.email, tt.password)
			if tt.expectError && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tt.expectError && err != nil {
				t.Fatalf("expected nil error, got %v", err)
			}
		})
	}
}

func TestDisplayNameOrEmail(t *testing.T) {
	withDisplay := displayNameOrEmail(database.User{Email: "kindrid@example.com", DisplayName: sql.NullString{String: "Kindrid", Valid: true}})
	if withDisplay != "Kindrid" {
		t.Fatalf("expected display name, got %q", withDisplay)
	}

	withoutDisplay := displayNameOrEmail(database.User{Email: "kindrid@example.com"})
	if withoutDisplay != "kindrid@example.com" {
		t.Fatalf("expected email fallback, got %q", withoutDisplay)
	}
}

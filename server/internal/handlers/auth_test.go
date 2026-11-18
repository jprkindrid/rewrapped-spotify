package handlers

import (
	"testing"
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

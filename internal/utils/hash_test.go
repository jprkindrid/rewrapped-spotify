package utils

import "testing"

func TestHashEmail(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		expected string
	}{
		{
			name:     "basic email",
			email:    "test@example.com",
			expected: "973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b",
		},
		{
			name:     "empty string",
			email:    "",
			expected: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := HashEmail(tt.email)
			if result != tt.expected {
				t.Errorf("HashEmail(%s) = %s; want %s",
					tt.email, result, tt.expected)
			}
		})
	}
}

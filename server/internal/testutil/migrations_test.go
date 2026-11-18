package testutil

import (
	"database/sql"
	"testing"
)

// TestOptionalAccountsMigrationPreservesUsers runs 003 over rows shaped like
// production data under the old schema and checks nothing is lost.
func TestOptionalAccountsMigrationPreservesUsers(t *testing.T) {
	db := OpenDB(t)
	ApplyMigrations(t, db, "", "002")

	legacy := []struct {
		id, email, passwordHash, storageKey string
		displayName                         sql.NullString
	}{
		{"uuid-1", "person@example.com", "bcrypt-hash", "user-data/person@example.com/a.json", sql.NullString{String: "Person", Valid: true}},
		{"", "NoIdLegacy", "", "user-data/NoIdLegacy/b.json", sql.NullString{}},
		{"uuid-3", "Kindrid_Spotify", "", "", sql.NullString{}},
	}
	for _, u := range legacy {
		if _, err := db.Exec(
			`INSERT INTO users (id, email, password_hash, storage_key, display_name) VALUES (?, ?, ?, ?, ?)`,
			u.id, u.email, u.passwordHash, u.storageKey, u.displayName,
		); err != nil {
			t.Fatalf("seed %q: %v", u.email, err)
		}
	}

	ApplyMigrations(t, db, "002", "")

	for _, u := range legacy {
		t.Run(u.email, func(t *testing.T) {
			var (
				id, storageKey            string
				passwordHash, displayName sql.NullString
				isGuest                   bool
				tokenVersion              int64
			)
			err := db.QueryRow(
				`SELECT id, password_hash, storage_key, display_name, is_guest, token_version FROM users WHERE email = ?`,
				u.email,
			).Scan(&id, &passwordHash, &storageKey, &displayName, &isGuest, &tokenVersion)
			if err != nil {
				t.Fatalf("row missing after migration (emails must be copied verbatim): %v", err)
			}

			if u.id != "" && id != u.id {
				t.Errorf("id changed: got %q, want %q", id, u.id)
			}
			if u.id == "" && len(id) != 32 {
				t.Errorf("missing id should be backfilled with a random one, got %q", id)
			}
			if u.passwordHash == "" && passwordHash.Valid {
				t.Errorf("empty password hash should become NULL, got %q", passwordHash.String)
			}
			if u.passwordHash != "" && passwordHash.String != u.passwordHash {
				t.Errorf("password hash changed")
			}
			if storageKey != u.storageKey {
				t.Errorf("storage key changed: got %q, want %q", storageKey, u.storageKey)
			}
			if displayName != u.displayName {
				t.Errorf("display name changed: got %v, want %v", displayName, u.displayName)
			}
			if isGuest || tokenVersion != 0 {
				t.Errorf("existing users must be accounts at version 0, got guest=%v version=%d", isGuest, tokenVersion)
			}
		})
	}

	// Guests have no email; several must coexist under the UNIQUE constraint.
	for _, id := range []string{"guest-a", "guest-b"} {
		if _, err := db.Exec(`INSERT INTO users (id, is_guest) VALUES (?, 1)`, id); err != nil {
			t.Fatalf("insert guest %s: %v", id, err)
		}
	}
}

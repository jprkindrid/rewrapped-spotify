// Package testutil holds helpers shared by tests.
package testutil

import (
	"database/sql"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"testing"

	_ "modernc.org/sqlite"
)

// SchemaDir is the goose migrations directory, found relative to this file so
// tests work from any package.
func SchemaDir(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("cannot locate testutil source file")
	}
	return filepath.Join(filepath.Dir(file), "..", "..", "sql", "schema")
}

// OpenDB opens a fresh SQLite database in a temp dir with no schema.
func OpenDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "test.sqlite"))
	if err != nil {
		t.Fatalf("failed opening sqlite db: %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

// MigratedDB opens a fresh database with every migration applied, the same
// files goose runs in production.
func MigratedDB(t *testing.T) *sql.DB {
	t.Helper()
	db := OpenDB(t)
	ApplyMigrations(t, db, "", "")
	return db
}

// ApplyMigrations runs the "Up" section of each migration in order. It skips
// files up to and including the one whose name starts with after, and stops
// after the one whose name starts with upTo. Empty means no bound.
func ApplyMigrations(t *testing.T, db *sql.DB, after, upTo string) {
	t.Helper()

	files, err := filepath.Glob(filepath.Join(SchemaDir(t), "*.sql"))
	if err != nil {
		t.Fatalf("failed listing migrations: %v", err)
	}
	sort.Strings(files)

	skipping := after != ""
	for _, file := range files {
		if skipping {
			skipping = !strings.HasPrefix(filepath.Base(file), after)
			continue
		}
		raw, err := os.ReadFile(file)
		if err != nil {
			t.Fatalf("failed reading %s: %v", file, err)
		}
		if _, err := db.Exec(upSection(string(raw))); err != nil {
			t.Fatalf("migration %s failed: %v", filepath.Base(file), err)
		}
		if upTo != "" && strings.HasPrefix(filepath.Base(file), upTo) {
			return
		}
	}
}

func upSection(migration string) string {
	_, after, found := strings.Cut(migration, "-- +goose Up")
	if !found {
		return migration
	}
	up, _, _ := strings.Cut(after, "-- +goose Down")
	return up
}

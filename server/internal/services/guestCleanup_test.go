package services

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

type recordingBlobs struct {
	deleted []string
	failFor map[string]bool
}

func (b *recordingBlobs) DeleteExistingBlob(_ context.Context, key string) error {
	if b.failFor[key] {
		return errors.New("storage unavailable")
	}
	b.deleted = append(b.deleted, key)
	return nil
}

type recordingCache struct{ deleted []string }

func (c *recordingCache) Delete(userID string) { c.deleted = append(c.deleted, userID) }

func TestCleanupExpiredGuests(t *testing.T) {
	queries := setupDB(t)
	ctx := context.Background()
	now := time.Date(2026, 6, 1, 12, 0, 0, 0, time.UTC)

	mkGuest := func(id, storageKey string, expires time.Time) {
		t.Helper()
		if _, err := queries.CreateGuestUser(ctx, database.CreateGuestUserParams{
			ID:             id,
			GuestExpiresAt: sql.NullTime{Time: expires, Valid: true},
		}); err != nil {
			t.Fatal(err)
		}
		if storageKey != "" {
			if _, err := queries.UpdateUserStorageKey(ctx, database.UpdateUserStorageKeyParams{ID: id, StorageKey: storageKey}); err != nil {
				t.Fatal(err)
			}
		}
	}

	mkGuest("expired-with-data", "blob-1", now.Add(-time.Hour))
	mkGuest("expired-no-data", "", now.Add(-time.Minute))
	mkGuest("expired-storage-down", "blob-stuck", now.Add(-time.Hour))
	mkGuest("still-valid", "blob-2", now.Add(time.Hour))
	seedUser(t, queries, "account@example.com", "blob-account", "hash")

	blobs := &recordingBlobs{failFor: map[string]bool{"blob-stuck": true}}
	cache := &recordingCache{}

	removed, err := CleanupExpiredGuests(ctx, queries, blobs, cache, now)
	if err != nil {
		t.Fatalf("cleanup: %v", err)
	}
	if removed != 2 {
		t.Fatalf("removed %d guests, want 2", removed)
	}

	exists := func(id string) bool {
		_, err := queries.GetUserByID(ctx, id)
		return err == nil
	}
	for id, want := range map[string]bool{
		"expired-with-data":    false,
		"expired-no-data":      false,
		"expired-storage-down": true, // kept so the blob isn't orphaned; retried next run
		"still-valid":          true,
		"account@example.com":  true,
	} {
		if exists(id) != want {
			t.Errorf("user %q exists = %v, want %v", id, !want, want)
		}
	}

	if len(blobs.deleted) != 1 || blobs.deleted[0] != "blob-1" {
		t.Errorf("deleted blobs = %v, want [blob-1]", blobs.deleted)
	}
	if len(cache.deleted) != 2 {
		t.Errorf("cache evictions = %v, want the 2 removed guests", cache.deleted)
	}
}

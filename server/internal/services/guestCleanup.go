package services

import (
	"context"
	"database/sql"
	"log/slog"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/database"
)

// GuestCleanupStore is the subset of queries the cleanup needs.
type GuestCleanupStore interface {
	ListExpiredGuests(ctx context.Context, now sql.NullTime) ([]database.User, error)
	DeleteUserByID(ctx context.Context, id string) error
	DeleteExpiredEmailTokens(ctx context.Context, before time.Time) error
}

type BlobDeleter interface {
	DeleteExistingBlob(ctx context.Context, key string) error
}

type CacheDeleter interface {
	Delete(userID string)
}

// CleanupExpiredGuests deletes guests whose retention period has passed,
// along with their uploaded data, and prunes old email tokens. It returns how
// many guests were removed.
func CleanupExpiredGuests(ctx context.Context, store GuestCleanupStore, blobs BlobDeleter, cache CacheDeleter, now time.Time) (int, error) {
	now = now.UTC().Truncate(time.Second)
	removed := 0

	// ListExpiredGuests returns at most 100 per call; loop until done.
	for {
		guests, err := store.ListExpiredGuests(ctx, sql.NullTime{Time: now, Valid: true})
		if err != nil {
			return removed, err
		}
		if len(guests) == 0 {
			break
		}

		progressed := false
		for _, guest := range guests {
			if guest.StorageKey != "" {
				if err := blobs.DeleteExistingBlob(ctx, guest.StorageKey); err != nil {
					// Keep the row so the next run retries; deleting it would
					// orphan the blob.
					slog.Warn("[CLEANUP] failed to delete guest data", "user_id", guest.ID, "error", err)
					continue
				}
			}
			if err := store.DeleteUserByID(ctx, guest.ID); err != nil {
				slog.Warn("[CLEANUP] failed to delete guest", "user_id", guest.ID, "error", err)
				continue
			}
			cache.Delete(guest.ID)
			removed++
			progressed = true
		}

		if !progressed {
			break
		}
	}

	// Keep used/expired tokens a day for debugging, then drop them.
	if err := store.DeleteExpiredEmailTokens(ctx, now.Add(-24*time.Hour)); err != nil {
		return removed, err
	}

	return removed, nil
}

// StartGuestCleanup runs CleanupExpiredGuests now and then every interval
// until ctx is cancelled.
func StartGuestCleanup(ctx context.Context, store GuestCleanupStore, blobs BlobDeleter, cache CacheDeleter, interval time.Duration) {
	run := func() {
		removed, err := CleanupExpiredGuests(ctx, store, blobs, cache, time.Now())
		if err != nil {
			slog.Error("[CLEANUP] guest cleanup failed", "error", err)
			return
		}
		if removed > 0 {
			slog.Info("[CLEANUP] removed expired guests", "count", removed)
		}
	}

	go func() {
		run()
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				run()
			}
		}
	}()
}

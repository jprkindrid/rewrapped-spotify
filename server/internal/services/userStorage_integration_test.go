package services

import (
	"context"
	"database/sql"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/storage"
	_ "modernc.org/sqlite"
)

type storedObject struct {
	body     []byte
	metadata map[string]string
}

type fakeS3 struct {
	mu      sync.Mutex
	objects map[string]storedObject
}

func newFakeS3Server() (*fakeS3, *httptest.Server) {
	f := &fakeS3{objects: make(map[string]storedObject)}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bucket, key, ok := parseBucketAndKey(r.URL)
		if !ok {
			http.Error(w, "bad s3 path", http.StatusBadRequest)
			return
		}

		objectKey := bucket + "/" + key

		switch r.Method {
		case http.MethodPut:
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "failed reading body", http.StatusInternalServerError)
				return
			}

			metadata := map[string]string{}
			for header, values := range r.Header {
				if len(values) == 0 {
					continue
				}
				h := strings.ToLower(header)
				if after, ok0 := strings.CutPrefix(h, "x-amz-meta-"); ok0 {
					metadata[after] = values[0]
				}
			}

			f.mu.Lock()
			f.objects[objectKey] = storedObject{body: body, metadata: metadata}
			f.mu.Unlock()

			w.WriteHeader(http.StatusOK)
			return

		case http.MethodGet:
			f.mu.Lock()
			obj, exists := f.objects[objectKey]
			f.mu.Unlock()
			if !exists {
				http.NotFound(w, r)
				return
			}

			for k, v := range obj.metadata {
				w.Header().Set("x-amz-meta-"+k, v)
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(obj.body)
			return

		case http.MethodDelete:
			f.mu.Lock()
			delete(f.objects, objectKey)
			f.mu.Unlock()
			w.WriteHeader(http.StatusNoContent)
			return

		default:
			http.Error(w, "unsupported", http.StatusMethodNotAllowed)
		}
	}))

	return f, srv
}

func parseBucketAndKey(u *url.URL) (string, string, bool) {
	path := strings.TrimPrefix(u.Path, "/")
	if path == "" {
		return "", "", false
	}

	parts := strings.SplitN(path, "/", 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", "", false
	}

	key, err := url.PathUnescape(parts[1])
	if err != nil {
		return "", "", false
	}

	return parts[0], key, true
}

func setupDB(t *testing.T) *database.Queries {
	t.Helper()

	dbFile := filepath.Join(t.TempDir(), "test.sqlite")
	db, err := sql.Open("sqlite", dbFile)
	if err != nil {
		t.Fatalf("failed opening sqlite db: %v", err)
	}

	t.Cleanup(func() {
		_ = db.Close()
	})

	schema := `
CREATE TABLE users (
    id            TEXT      UNIQUE NOT NULL PRIMARY KEY,
    created_at    DATETIME  NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME  NOT NULL DEFAULT (datetime('now')),
    email         TEXT      UNIQUE NOT NULL,
    password_hash TEXT      NOT NULL,
    storage_key   TEXT      NOT NULL,
    display_name  TEXT
);`

	if _, err := db.Exec(schema); err != nil {
		t.Fatalf("failed creating schema: %v", err)
	}

	return database.New(db)
}

func setupStorageConfig(endpoint string) *config.Config {
	return &config.Config{
		Storage: &config.StorageConfig{
			BucketName: "test-bucket",
			AccountID:  "test-account",
			KeyID:      "test-key",
			KeySecret:  "test-secret",
			Endpoint:   endpoint,
		},
	}
}

func requestWithUser(t *testing.T, email string) *http.Request {
	t.Helper()

	req := httptest.NewRequest(http.MethodPost, "/api/upload", nil)
	ctx := context.WithValue(req.Context(), constants.UserIDKey, email)
	return req.WithContext(ctx)
}

func sampleData(trackSuffix string) []parser.MinifiedSongData {
	return []parser.MinifiedSongData{
		{
			Ts:              time.Date(2025, time.January, 1, 10, 0, 0, 0, time.UTC),
			Username:        "dummy-user",
			MsPlayed:        120000,
			TrackName:       "Track " + trackSuffix,
			ArtistName:      "Artist",
			AlbumName:       "Album",
			SpotifyTrackURI: "spotify:track:test",
		},
	}
}

func TestStoreData_CreateAndReadBackFromStorage(t *testing.T) {
	fake, srv := newFakeS3Server()
	defer srv.Close()

	cfg := setupStorageConfig(srv.URL)
	storage.Init(cfg)

	queries := setupDB(t)
	email := "tester@example.com"

	seedUser(t, queries, email, "init-key-a", "pw-hash-a")

	created, err := StoreData(requestWithUser(t, email), sampleData("A"), queries, cfg)
	if err != nil {
		t.Fatalf("store data failed: %v", err)
	}

	if created.Email != email {
		t.Fatalf("expected email %q, got %q", email, created.Email)
	}
	if created.StorageKey == "" {
		t.Fatalf("expected storage key to be populated")
	}

	readBack, err := storage.GetClient(cfg).GetJSON(context.Background(), created.StorageKey)
	if err != nil {
		t.Fatalf("get json failed: %v", err)
	}

	if len(readBack) != 1 || readBack[0].TrackName != "Track A" {
		t.Fatalf("unexpected readback payload: %#v", readBack)
	}

	fake.mu.Lock()
	_, exists := fake.objects[cfg.Storage.BucketName+"/"+created.StorageKey]
	fake.mu.Unlock()
	if !exists {
		t.Fatalf("expected uploaded object to exist in fake storage")
	}
}

func TestStoreData_UpdateReplacesOldBlob(t *testing.T) {
	fake, srv := newFakeS3Server()
	defer srv.Close()

	cfg := setupStorageConfig(srv.URL)
	storage.Init(cfg)

	queries := setupDB(t)
	email := "tester@example.com"

	seedUser(t, queries, email, "init-key-b", "pw-hash-b")

	first, err := StoreData(requestWithUser(t, email), sampleData("A"), queries, cfg)
	if err != nil {
		t.Fatalf("first store failed: %v", err)
	}

	second, err := StoreData(requestWithUser(t, email), sampleData("B"), queries, cfg)
	if err != nil {
		t.Fatalf("second store failed: %v", err)
	}

	if first.StorageKey == second.StorageKey {
		t.Fatalf("expected a new storage key on update")
	}

	updated, err := queries.GetUserByEmail(context.Background(), email)
	if err != nil {
		t.Fatalf("get user by email failed: %v", err)
	}
	if updated.StorageKey != second.StorageKey {
		t.Fatalf("expected db storage key %q, got %q", second.StorageKey, updated.StorageKey)
	}

	fake.mu.Lock()
	_, oldExists := fake.objects[cfg.Storage.BucketName+"/"+first.StorageKey]
	_, newExists := fake.objects[cfg.Storage.BucketName+"/"+second.StorageKey]
	fake.mu.Unlock()

	if oldExists {
		t.Fatalf("expected old blob to be deleted")
	}
	if !newExists {
		t.Fatalf("expected new blob to exist")
	}

	readBack, err := storage.GetClient(cfg).GetJSON(context.Background(), second.StorageKey)
	if err != nil {
		t.Fatalf("get json failed: %v", err)
	}
	if len(readBack) != 1 || readBack[0].TrackName != "Track B" {
		t.Fatalf("unexpected updated payload: %#v", readBack)
	}
}

func seedUser(t *testing.T, queries *database.Queries, email, storageKey, passwordHash string) {
	t.Helper()

	_, err := queries.CreateUser(context.Background(), database.CreateUserParams{
		ID:           email,
		Email:        email,
		PasswordHash: passwordHash,
		StorageKey:   storageKey,
	})
	if err != nil {
		t.Fatalf("failed to seed user row: %v", err)
	}
}

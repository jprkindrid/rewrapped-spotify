-- +goose Up
CREATE TABLE IF NOT EXISTS track_artist_pairings (
    id TEXT PRIMARY KEY,
    created_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    track_uri    TEXT      NOT NULL,
    artist_uri   TEXT
);

-- +goose Down
DROP TABLE IF EXISTS track_artist_pairings;
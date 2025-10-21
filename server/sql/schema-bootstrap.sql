-- OO1_users
CREATE TABLE IF NOT EXISTS users (
    id          TEXT      PRIMARY KEY,                     
    created_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    spotify_id  TEXT      UNIQUE  NOT NULL,
    storage_key TEXT      NOT NULL                          
);

-- 002_track_artist_pairings

CREATE TABLE IF NOT EXISTS track_artist_pairings (
    id TEXT PRIMARY KEY,
    created_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    track_uri    TEXT      NOT NULL,
    artist_uri   TEXT
);
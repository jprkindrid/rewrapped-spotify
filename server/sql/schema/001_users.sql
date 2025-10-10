-- +goose Up
CREATE TABLE IF NOT EXISTS users (
    id          TEXT      PRIMARY KEY,                     
    created_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    updated_at  DATETIME  NOT NULL DEFAULT (datetime('now')),
    spotify_id  TEXT      UNIQUE  NOT NULL,
    data        TEXT      NOT NULL                          
);

-- +goose Down
DROP TABLE IF EXISTS users;

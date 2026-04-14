-- +goose Up
CREATE TABLE IF NOT EXISTS users (
    id              TEXT      UNIQUE NOT NULL PRIMARY KEY,
    created_at      DATETIME  NOT NULL DEFAULT (datetime('now')),
    updated_at      DATETIME  NOT NULL DEFAULT (datetime('now')),
    email           TEXT      UNIQUE NOT NULL,
    password_hash   TEXT      NOT NULL,
    storage_key     TEXT      NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS users;
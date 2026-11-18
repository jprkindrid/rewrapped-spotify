-- Optional accounts: guest users, passwordless sign-in, revocable sessions.
--
-- SQLite can't drop NOT NULL in place, so the users table is rebuilt:
--   * email and password_hash become nullable (guests have neither; email-link
--     accounts may have no password). Empty strings become NULL; other values
--     are copied verbatim (legacy ids such as the demo user's are matched exactly).
--   * any row with a missing id gets a random one, since id is now the identity.
--   * is_guest / guest_expires_at mark temporary accounts.
--   * token_version is embedded in session tokens; bumping it revokes them.

-- +goose Up
CREATE TABLE users_new (
    id               TEXT     NOT NULL PRIMARY KEY,
    created_at       DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at       DATETIME NOT NULL DEFAULT (datetime('now')),
    email            TEXT     UNIQUE,
    password_hash    TEXT,
    storage_key      TEXT     NOT NULL DEFAULT '',
    display_name     TEXT,
    is_guest         BOOLEAN  NOT NULL DEFAULT 0,
    guest_expires_at DATETIME,
    token_version    INTEGER  NOT NULL DEFAULT 0
);

INSERT INTO users_new (id, created_at, updated_at, email, password_hash, storage_key, display_name)
SELECT
    CASE WHEN id IS NULL OR id = '' THEN lower(hex(randomblob(16))) ELSE id END,
    created_at,
    updated_at,
    NULLIF(email, ''),
    NULLIF(password_hash, ''),
    COALESCE(storage_key, ''),
    display_name
FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

CREATE INDEX idx_users_guest_expiry ON users (guest_expires_at) WHERE is_guest = 1;

CREATE TABLE email_tokens (
    token_hash  TEXT     NOT NULL PRIMARY KEY,
    user_id     TEXT     NOT NULL,
    purpose     TEXT     NOT NULL,
    email       TEXT     NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now')),
    expires_at  DATETIME NOT NULL,
    used_at     DATETIME
);

CREATE INDEX idx_email_tokens_email ON email_tokens (email, created_at);

-- +goose Down
DROP TABLE IF EXISTS email_tokens;

CREATE TABLE users_old (
    id            TEXT     UNIQUE NOT NULL PRIMARY KEY,
    created_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    email         TEXT     UNIQUE NOT NULL,
    password_hash TEXT     NOT NULL,
    storage_key   TEXT     NOT NULL,
    display_name  TEXT
);

-- Guests have no email and can't be represented in the old schema.
INSERT INTO users_old (id, created_at, updated_at, email, password_hash, storage_key, display_name)
SELECT id, created_at, updated_at, email, COALESCE(password_hash, ''), storage_key, display_name
FROM users
WHERE email IS NOT NULL;

DROP TABLE users;

ALTER TABLE users_old RENAME TO users;

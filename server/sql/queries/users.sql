-- name: CreateUser :one
INSERT INTO users (id, created_at, updated_at, email, password_hash, storage_key, display_name)
VALUES (
    sqlc.arg(id), datetime('now'), datetime('now'), sqlc.arg(email), sqlc.narg(password_hash), '', sqlc.narg(display_name)
)
RETURNING *;

-- name: CreateGuestUser :one
INSERT INTO users (id, created_at, updated_at, storage_key, is_guest, guest_expires_at)
VALUES (
    sqlc.arg(id), datetime('now'), datetime('now'), '', 1, sqlc.arg(guest_expires_at)
)
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = sqlc.arg(id);

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = sqlc.arg(email);

-- name: UpdateUserStorageKey :one
UPDATE users
SET storage_key = sqlc.arg(storage_key), updated_at = datetime('now')
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DeleteUserByID :exec
DELETE FROM users
WHERE id = sqlc.arg(id);

-- name: UpdateUserEmail :one
UPDATE users
SET email = sqlc.arg(email), updated_at = datetime('now')
WHERE id = sqlc.arg(id)
RETURNING *;

-- Setting a password signs out every other session by bumping token_version.
-- name: UpdateUserPassword :one
UPDATE users
SET password_hash = sqlc.arg(password_hash),
    token_version = token_version + 1,
    updated_at = datetime('now')
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: UpdateDisplayName :one
UPDATE users
SET display_name = sqlc.narg(display_name), updated_at = datetime('now')
WHERE id = sqlc.arg(id)
RETURNING *;

-- Turns a guest into a permanent account, keeping its uploaded data.
-- name: ClaimGuestUser :one
UPDATE users
SET email = sqlc.arg(email),
    password_hash = COALESCE(sqlc.narg(password_hash), password_hash),
    display_name = COALESCE(sqlc.narg(display_name), display_name),
    is_guest = 0,
    guest_expires_at = NULL,
    updated_at = datetime('now')
WHERE id = sqlc.arg(id) AND is_guest = 1
RETURNING *;

-- name: ListExpiredGuests :many
SELECT * FROM users
WHERE is_guest = 1 AND guest_expires_at < sqlc.arg(now)
LIMIT 100;

-- name: CreateEmailToken :exec
INSERT INTO email_tokens (token_hash, user_id, purpose, email, created_at, expires_at)
VALUES (sqlc.arg(token_hash), sqlc.arg(user_id), sqlc.arg(purpose), sqlc.arg(email), sqlc.arg(created_at), sqlc.arg(expires_at));

-- Marks a token used and returns it in one statement, so a link works only once.
-- name: ConsumeEmailToken :one
UPDATE email_tokens
SET used_at = sqlc.arg(used_at)
WHERE token_hash = sqlc.arg(token_hash)
  AND used_at IS NULL
  AND expires_at > sqlc.arg(now)
RETURNING *;

-- name: CountRecentEmailTokens :one
SELECT COUNT(*) FROM email_tokens
WHERE email = sqlc.arg(email) AND created_at > sqlc.arg(since);

-- name: DeleteExpiredEmailTokens :exec
DELETE FROM email_tokens
WHERE expires_at < sqlc.arg(before);

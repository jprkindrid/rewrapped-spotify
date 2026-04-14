-- name: CreateUser :one
INSERT INTO users (id, created_at, updated_at, email, password_hash, storage_key, display_name)
VALUES (
   ?1 ,datetime('now'), datetime('now'), ?2, ?3, ?4, ?5
)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = ?1;

-- name: ResetUsers :exec
DELETE FROM users;

-- name: UpdateUserData :one
UPDATE users 
SET storage_key = ?2, updated_at = datetime('now')
WHERE email = ?1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users
WHERE email = ?1;

-- name: UpdateUserEmail :one
UPDATE users
SET email = ?2, updated_at = datetime('now')
WHERE email = ?1
RETURNING *;

-- name: UpdateUserPassword :exec
UPDATE users
SET password_hash = ?2, updated_at = datetime('now')
WHERE email = ?1;

-- name: UpdateDisplayName :one
UPDATE users
SET display_name = ?2, updated_at = datetime('now')
WHERE email = ?1
RETURNING *;
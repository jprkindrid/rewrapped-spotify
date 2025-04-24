-- name: CreateUser :one
INSERT INTO users (id, created_at, updated_at, spotify_id, data)
VALUES (
   ?1 ,datetime('now'), datetime('now'), ?2, ?3
)
RETURNING *;

-- name: GetUserData :one
SELECT * FROM users
WHERE spotify_id = ?1;

-- name: ResetUsers :exec
DELETE FROM users;

-- name: UpdateUser :one
UPDATE users 
SET data = ?2, updated_at = datetime('now')
WHERE id = ?1
RETURNING *;
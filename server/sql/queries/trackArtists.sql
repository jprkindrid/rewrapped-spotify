-- name: CreatePairing :one
INSERT INTO track_artist_pairings (id, created_at, updated_at, track_uri, artist_uri)
VALUES (
   ?1 ,datetime('now'), datetime('now'), ?2, ?3
)
RETURNING *;

-- name: GetPairingByTrack :one
SELECT * FROM track_artist_pairings
WHERE track_uri = ?1;
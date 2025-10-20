package parser

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"

	"github.com/google/uuid"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
)

func VerifyTrackArtistIDRelations(userSongData []MinifiedSongData, db *database.Queries) error {

	spotifyClient := spotify.GetClient()
	pairCache := make(map[string]string)

	var trackBuffer []string
	bufferSet := make(map[string]struct{})

	for i := range userSongData {
		song := &userSongData[i]

		artistUri, err := checkTrackPairing(song, db, pairCache, &trackBuffer, bufferSet)
		if err != nil {
			slog.Error("could not varify track artist id relation", "err", err)
			continue
		}

		if len(trackBuffer) > 45 {
			flushVerificationBuffer(&trackBuffer, bufferSet, spotifyClient, userSongData, db, pairCache)
		}

		if artistUri == "" {
			// added to request buffer
			continue
		}

		userSongData[i].SpotifyArtistURI = artistUri

	}

	if len(trackBuffer) > 0 {
		flushVerificationBuffer(&trackBuffer, bufferSet, spotifyClient, userSongData, db, pairCache)
	}

	return nil
}

func flushVerificationBuffer(
	trackBuffer *[]string,
	bufferSet map[string]struct{},
	spotifyClient *spotify.SpotifyClient,
	userSongData []MinifiedSongData,
	db *database.Queries,
	pairCache map[string]string,
) {
	tracks, err := spotifyClient.GetSeveralTracksData(*trackBuffer)

	if err != nil {
		slog.Error("couldnt batch request tracks", "err", err)

	}
	for _, track := range tracks {
		checkTrackArtistID(userSongData, db, pairCache, track)
	}

	*trackBuffer = (*trackBuffer)[:0]
	clear(bufferSet)

}

func checkTrackPairing(
	song *MinifiedSongData,
	db *database.Queries,
	pairCache map[string]string,
	trackBuffer *[]string,
	bufferSet map[string]struct{},
) (string, error) {

	if artistURI := pairCache[song.SpotifyTrackURI]; artistURI != "" {
		return artistURI, nil
	}

	dbEntry, err := db.GetPairingByTrack(context.Background(), song.SpotifyTrackURI)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return "", err
	}

	if err == nil {
		pairCache[song.SpotifyTrackURI] = dbEntry.ArtistUri.String
		return dbEntry.ArtistUri.String, nil
	}

	if _, exists := bufferSet[song.SpotifyTrackURI]; !exists {
		bufferSet[song.SpotifyTrackURI] = struct{}{}
		*trackBuffer = append(*trackBuffer, song.SpotifyTrackURI)
	}

	return "", nil

}

func checkTrackArtistID(
	userSongs []MinifiedSongData,
	db *database.Queries,
	pairCache map[string]string,
	track spotify.Track,
) {
	slog.Info("checking track id", "track", track.ID)
	if len(track.Artists) == 0 {
		slog.Error("could not update track pairing", "reason", "track returned zero artists", "URI", track.URI)
	}

	var artistUri string

	for _, song := range userSongs {
		if song.SpotifyTrackURI == track.URI {
			for _, artist := range track.Artists {
				if artist.Name == song.ArtistName {
					artistUri = song.SpotifyArtistURI
				}
			}
		}
	}

	if artistUri == "" {
		slog.Warn("could not update track pairing", "reason", "no matching artist names", "URI", track.URI)
		return
	}

	slog.Info("creating db pairing", "track", track.URI, "artist", artistUri)

	if err := createDbPairing(track.URI, artistUri, db); err != nil {
		slog.Error("could not update track pairing", "err", err, "trackURI", track.URI)
	}

	pairCache[track.URI] = artistUri

}

func createDbPairing(trackUri, artistUri string, db *database.Queries) error {
	slog.Info("creating db pairing", "track", trackUri, "artist", artistUri)
	_, err := db.CreatePairing(context.Background(), database.CreatePairingParams{
		ID:       uuid.New().String(),
		TrackUri: trackUri,
		ArtistUri: sql.NullString{
			String: artistUri,
			Valid:  artistUri != "",
		},
	})

	return err
}

package parser

import (
	"log/slog"
	"time"
)

type MinifiedSongData struct {
	Ts               time.Time
	Username         string
	MsPlayed         int // time milliseconds
	TrackName        string
	ArtistName       string
	AlbumName        string
	SpotifyTrackURI  string
	SpotifyArtistURI string
}

func MinifyParsedData(parsedData []UserSongData) []MinifiedSongData {
	if parsedData == nil {
		slog.Debug("No parsed data to minify")
		return nil
	}

	minifiedData := make([]MinifiedSongData, 0, len(parsedData))
	for _, data := range parsedData {
		result := minifyUserSongData(data)
		minifiedData = append(minifiedData, result)
	}

	return minifiedData
}

func minifyUserSongData(data UserSongData) MinifiedSongData {
	return MinifiedSongData{
		Ts:               data.Ts,
		Username:         data.Username,
		MsPlayed:         data.MsPlayed,
		TrackName:        data.MasterMetadataTrackName,
		ArtistName:       data.MasterMetadataAlbumArtistName,
		AlbumName:        data.MasterMetadataAlbumAlbumName,
		SpotifyTrackURI:  data.SpotifyTrackURI,
		SpotifyArtistURI: "",
	}
}

package parser

import (
	"encoding/json"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type UserSongData struct {
	Ts                            time.Time `json:"ts"`
	Username                      string    `json:"username"`
	Platform                      string    `json:"platform"`
	MsPlayed                      int       `json:"ms_played"` // time milliseconds
	ConnCountry                   string    `json:"conn_country"`
	IPAddrDecrypted               string    `json:"ip_addr_decrypted"`
	UserAgentDecrypted            string    `json:"user_agent_decrypted"`
	MasterMetadataTrackName       string    `json:"master_metadata_track_name"`
	MasterMetadataAlbumArtistName string    `json:"master_metadata_album_artist_name"`
	MasterMetadataAlbumAlbumName  string    `json:"master_metadata_album_album_name"`
	SpotifyTrackURI               string    `json:"spotify_track_uri"`
	EpisodeName                   string    `json:"episode_name"`
	EpisodeShowName               string    `json:"episode_show_name"`
	SpotifyEpisodeURI             string    `json:"spotify_episode_uri"`
	ReasonStart                   string    `json:"reason_start"`
	ReasonEnd                     string    `json:"reason_end"`
	Shuffle                       bool      `json:"shuffle"`
	Skipped                       bool      `json:"skipped"`
	Offline                       bool      `json:"offline"`
	OfflineTimestamp              int       `json:"offline_timestamp"`
	IncognitoMode                 bool      `json:"incognito_mode"`
}

func ParseJsonFiles(filePaths []string) ([]UserSongData, error) {
	var allSongs []UserSongData

	for _, path := range filePaths {
		if filepath.Ext(path) != ".json" {
			continue
		}

		jsonFile, err := os.Open(path)
		if err != nil {
			return nil, err
		}
		defer jsonFile.Close()

		byteValue, err := io.ReadAll(jsonFile)
		if err != nil {
			return nil, err
		}

		var songs []UserSongData
		err = json.Unmarshal(byteValue, &songs)
		if err != nil {
			return nil, err
		}

		for _, entry := range songs {
			if normalizeEntry(&entry) {
				allSongs = append(allSongs, entry)
			}
		}

	}

	return allSongs, nil
}

func normalizeEntry(song *UserSongData) bool {
	if song.EpisodeName != "" || song.EpisodeShowName != "" {
		log.Printf("⏩ Skipped podcast: %s — %s (%d ms)", song.MasterMetadataAlbumArtistName, song.MasterMetadataTrackName, song.MsPlayed)
		// we dont give a shit about podcasts lol
		// 3 BAGILLION MORE DOLLARS TO JOE ROGAN
		return false
	}

	if song.MasterMetadataTrackName == "" {
		log.Printf("⏩ Skipped: %s — %s, missing track name", song.MasterMetadataAlbumArtistName, song.MasterMetadataTrackName)
		return false
	}

	if song.MasterMetadataAlbumArtistName == "" {
		log.Printf("⏩ Skipped: %s — %s, missing artist name", song.MasterMetadataAlbumArtistName, song.MasterMetadataTrackName)
		return false
	}

	// Skip if under 30s (not considered a 'stream' by Spotify)
	if song.MsPlayed < 30000 {
		log.Printf("⏩ Skipped: %s — %s (%d ms), under 30s threshold", song.MasterMetadataAlbumArtistName, song.MasterMetadataTrackName, song.MsPlayed)
		return false
	}

	song.MasterMetadataTrackName = strings.TrimSpace(song.MasterMetadataTrackName)
	song.MasterMetadataAlbumArtistName = strings.TrimSpace(song.MasterMetadataAlbumArtistName)
	song.MasterMetadataAlbumAlbumName = strings.TrimSpace(song.MasterMetadataAlbumAlbumName)

	return true
}

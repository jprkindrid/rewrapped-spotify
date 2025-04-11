package parser

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
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

		allSongs = append(allSongs, songs...)

	}

	return allSongs, nil
}

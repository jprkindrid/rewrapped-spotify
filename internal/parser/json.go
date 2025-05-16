package parser

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
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
	//TODO: songid((fromURI)).album.images[3].url to get the tiny image
}

func ParseJsonFiles(filePaths []string) ([]UserSongData, error) {
	type result struct {
		songs []UserSongData
		err   error
	}

	resultCh := make(chan result, len(filePaths))
	var wg sync.WaitGroup

	for _, path := range filePaths {
		if filepath.Ext(path) != ".json" {
			continue
		}

		wg.Add(1)
		go func(path string) {
			defer wg.Done()
			jsonFile, err := os.Open(path)
			if err != nil {
				resultCh <- result{nil, err}
				return
			}

			byteValue, err := io.ReadAll(jsonFile)
			if err != nil {
				resultCh <- result{nil, err}
				return
			}
			jsonFile.Close()

			var songs []UserSongData
			err = json.Unmarshal(byteValue, &songs)
			if err != nil {
				resultCh <- result{nil, err}
				return
			}
			var normalizedSongs []UserSongData
			var normWg sync.WaitGroup
			normCh := make(chan UserSongData, len(songs))
			for _, entry := range songs {
				normWg.Add(1)
				go func(song UserSongData) {
					defer normWg.Done()
					if normalizeEntry(&song) {
						normCh <- song
					}
				}(entry)
			}

			go func() {
				normWg.Wait()
				close(normCh)
			}()

			for song := range normCh {
				normalizedSongs = append(normalizedSongs, song)
			}

			resultCh <- result{normalizedSongs, nil}
		}(path)
	}
	go func() {
		wg.Wait()
		close(resultCh)
	}()

	var allSongs []UserSongData
	var firstErr error

	for res := range resultCh {
		if res.err != nil && firstErr == nil {
			firstErr = res.err
		}
		allSongs = append(allSongs, res.songs...)
	}

	if len(allSongs) == 0 && firstErr != nil {
		return nil, firstErr
	}

	if len(allSongs) == 0 {
		return nil, fmt.Errorf("no valid song entries found in %d files", len(filePaths))

	}

	return allSongs, nil
}

func normalizeEntry(song *UserSongData) bool {
	if song.EpisodeName != "" || song.EpisodeShowName != "" {
		// skips podcasts
		// 3 BAGILLION MORE DOLLARS TO JOE ROGAN
		return false
	}

	if song.MasterMetadataTrackName == "" {
		return false
	}

	if song.MasterMetadataAlbumArtistName == "" {
		return false
	}

	// Skip if under 30s (not considered a 'stream' by Spotify)
	if song.MsPlayed < 30000 {
		return false
	}

	song.MasterMetadataTrackName = strings.TrimSpace(song.MasterMetadataTrackName)
	song.MasterMetadataAlbumArtistName = strings.TrimSpace(song.MasterMetadataAlbumArtistName)
	song.MasterMetadataAlbumAlbumName = strings.TrimSpace(song.MasterMetadataAlbumAlbumName)

	return true
}

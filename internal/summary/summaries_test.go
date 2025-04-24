package summary

import (
	"testing"
	"time"

	"github.com/kindiregg/spotify-data-analyzer/internal/parser"
)

func TestTopArtistsInRange(t *testing.T) {
	now := time.Now()
	testData := []parser.UserSongData{
		{
			Ts:                            now,
			MasterMetadataAlbumArtistName: "Artist A",
			MsPlayed:                      180000, // 3 minutes
		},
		{
			Ts:                            now,
			MasterMetadataAlbumArtistName: "Artist A",
			MsPlayed:                      120000, // 2 minutes
		},
	}

	results := TopArtistsInRange(testData, now.Add(-time.Hour), now.Add(time.Hour))

	if len(results) != 1 {
		t.Errorf("Expected 1 artist, got %d", len(results))
	}

	if results[0].TotalMs != 300000 {
		t.Errorf("Expected 300000ms total, got %d", results[0].TotalMs)
	}
}

func TestTopTracksInRange(t *testing.T) {
	now := time.Now()
	testData := []parser.UserSongData{
		{
			Ts:                            now,
			MasterMetadataTrackName:       "Track A",
			MasterMetadataAlbumArtistName: "Artist A",
			MsPlayed:                      180000,
		},
	}

	results := TopTracksInRange(testData, now.Add(-time.Hour), now.Add(time.Hour))

	if len(results) != 1 {
		t.Errorf("Expected 1 track, got %d", len(results))
	}
}

func TestTopArtistsInRangeEmpty(t *testing.T) {
	results := TopArtistsInRange(nil, time.Now(), time.Now())
	if len(results) != 0 {
		t.Errorf("Expected empty results for nil input, got %d entries", len(results))
	}
}

func TestTopTracksOutOfRange(t *testing.T) {
	now := time.Now()
	testData := []parser.UserSongData{
		{
			Ts:                            now,
			MasterMetadataTrackName:       "Track A",
			MasterMetadataAlbumArtistName: "Artist A",
			MsPlayed:                      180000,
		},
	}

	// Test time range that doesn't include the track
	results := TopTracksInRange(testData, now.Add(-2*time.Hour), now.Add(-1*time.Hour))
	if len(results) != 0 {
		t.Errorf("Expected no tracks outside time range, got %d", len(results))
	}
}

func TestGroupByYear(t *testing.T) {
	testData := []parser.UserSongData{
		{
			Ts:       time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC),
			MsPlayed: 180000,
		},
		{
			Ts:       time.Date(2023, 12, 31, 0, 0, 0, 0, time.UTC),
			MsPlayed: 120000,
		},
		{
			Ts:       time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			MsPlayed: 60000,
		},
	}

	grouped := GroupByYear(testData)

	if len(grouped) != 2 {
		t.Errorf("Expected 2 years, got %d", len(grouped))
	}

	if len(grouped[2023]) != 2 {
		t.Errorf("Expected 2 entries for 2023, got %d", len(grouped[2023]))
	}

	if len(grouped[2024]) != 1 {
		t.Errorf("Expected 1 entry for 2024, got %d", len(grouped[2024]))
	}
}

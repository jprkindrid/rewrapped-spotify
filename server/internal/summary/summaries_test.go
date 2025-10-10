package summary

import (
	"testing"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

func TestTopArtistsInRange(t *testing.T) {
	now := time.Now()
	testData := []parser.MinifiedSongData{
		{
			Ts:         now,
			ArtistName: "Artist A",
			MsPlayed:   180000, // 3 minutes
		},
		{
			Ts:         now,
			ArtistName: "Artist A",
			MsPlayed:   120000, // 2 minutes
		},
	}

	results := TopArtistsInRange(testData, now.Add(-time.Hour), now.Add(time.Hour), "count")

	if len(results) != 1 {
		t.Errorf("Expected 1 artist, got %d", len(results))
	}

	if results[0].TotalMs != 300000 {
		t.Errorf("Expected 300000ms total, got %d", results[0].TotalMs)
	}
}

func TestTopTracksInRange(t *testing.T) {
	now := time.Now()
	testData := []parser.MinifiedSongData{
		{
			Ts:         now,
			TrackName:  "Track A",
			ArtistName: "Artist A",
			MsPlayed:   180000,
		},
	}

	results := TopTracksInRange(testData, now.Add(-time.Hour), now.Add(time.Hour), "count")

	if len(results) != 1 {
		t.Errorf("Expected 1 track, got %d", len(results))
	}
}

func TestTopArtistsInRangeEmpty(t *testing.T) {
	results := TopArtistsInRange(nil, time.Now(), time.Now(), "count")
	if len(results) != 0 {
		t.Errorf("Expected empty results for nil input, got %d entries", len(results))
	}
}

func TestTopTracksOutOfRange(t *testing.T) {
	now := time.Now()
	testData := []parser.MinifiedSongData{
		{
			Ts:         now,
			TrackName:  "Track A",
			ArtistName: "Artist A",
			MsPlayed:   180000,
		},
	}

	// Test time range that doesn't include the track
	results := TopTracksInRange(testData, now.Add(-2*time.Hour), now.Add(-1*time.Hour), "count")
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

func TestTopArtistsInRangeSortByTime(t *testing.T) {
	now := time.Now()
	testData := []parser.MinifiedSongData{
		{
			Ts:         now,
			ArtistName: "Artist A",
			MsPlayed:   180000,
		},
		{
			Ts:         now,
			ArtistName: "Artist A",
			MsPlayed:   120000,
		},
		{
			Ts:         now,
			ArtistName: "Artist B",
			MsPlayed:   400000,
		},
		{
			Ts:         now,
			ArtistName: "Artist C",
			MsPlayed:   90000,
		},
		{
			Ts:         now,
			ArtistName: "Artist C",
			MsPlayed:   90000,
		},
		{
			Ts:         now,
			ArtistName: "Artist C",
			MsPlayed:   90000,
		},
	}

	// By count, order should be: Artist C (3 plays), Artist A (2 plays), Artist B (1 play)
	resultsByCount := TopArtistsInRange(testData, now.Add(-time.Hour), now.Add(time.Hour), "count")

	if len(resultsByCount) != 3 {
		t.Errorf("Expected 3 artists, got %d", len(resultsByCount))
	}

	if resultsByCount[0].Name != "Artist C" || resultsByCount[1].Name != "Artist A" || resultsByCount[2].Name != "Artist B" {
		t.Errorf("Wrong sort order for count sorting. Got: %v, %v, %v",
			resultsByCount[0].Name, resultsByCount[1].Name, resultsByCount[2].Name)
	}

	// By time, order should be: Artist B (400,000ms), Artist A (300,000ms), Artist C (270,000ms)
	resultsByTime := TopArtistsInRange(testData, now.Add(-time.Hour), now.Add(time.Hour), "time")

	if len(resultsByTime) != 3 {
		t.Errorf("Expected 3 artists, got %d", len(resultsByTime))
	}

	if resultsByTime[0].Name != "Artist B" || resultsByTime[1].Name != "Artist A" || resultsByTime[2].Name != "Artist C" {
		t.Errorf("Wrong sort order for time sorting. Got: %v, %v, %v",
			resultsByTime[0].Name, resultsByTime[1].Name, resultsByTime[2].Name)
	}

	if resultsByTime[0].TotalMs != 400000 || resultsByTime[1].TotalMs != 300000 || resultsByTime[2].TotalMs != 270000 {
		t.Errorf("Wrong TotalMs values for time sorting. Got: %d, %d, %d",
			resultsByTime[0].TotalMs, resultsByTime[1].TotalMs, resultsByTime[2].TotalMs)
	}
}

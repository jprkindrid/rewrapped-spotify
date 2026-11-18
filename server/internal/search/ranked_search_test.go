package search

import (
	"testing"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

func TestSearchRankedArtistContainsAndPrefix(t *testing.T) {
	now := time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC)
	data := []parser.MinifiedSongData{
		{Ts: now, ArtistName: "The Beatles", TrackName: "Hey Jude", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:1"},
		{Ts: now, ArtistName: "Beat Connection", TrackName: "Cascades", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:2"},
		{Ts: now, ArtistName: "Heartbeats", TrackName: "Dream", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:3"},
	}

	results := SearchRanked(data, RankedSearchOptions{Query: "beat", Entity: EntityArtist, SortBy: "count"})

	if len(results) != 3 {
		t.Fatalf("expected 3 results, got %d", len(results))
	}

	if results[0].Name != "Beat Connection" {
		t.Fatalf("expected prefix match first, got %s", results[0].Name)
	}
}

func TestSearchRankedTrackMatchesTrackNameOnly(t *testing.T) {
	now := time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC)
	data := []parser.MinifiedSongData{
		{Ts: now, ArtistName: "The Searchers", TrackName: "Blue Sky", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:1"},
		{Ts: now, ArtistName: "Other Artist", TrackName: "Searchlight", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:2"},
	}

	results := SearchRanked(data, RankedSearchOptions{Query: "search", Entity: EntityTrack, SortBy: "count"})

	if len(results) != 1 {
		t.Fatalf("expected 1 track result, got %d", len(results))
	}

	if results[0].TrackName != "Searchlight" {
		t.Fatalf("expected track-name match result, got %s", results[0].TrackName)
	}
}

func TestSearchRankedUsesRangeRanking(t *testing.T) {
	inside := time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC)
	outside := time.Date(2023, 2, 1, 0, 0, 0, 0, time.UTC)

	data := []parser.MinifiedSongData{
		{Ts: inside, ArtistName: "Alpine", TrackName: "A", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:1"},
		{Ts: inside, ArtistName: "Alpine", TrackName: "A", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:1"},
		{Ts: outside, ArtistName: "Alpine", TrackName: "A", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:1"},
		{Ts: inside, ArtistName: "Alt-J", TrackName: "B", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:2"},
	}

	results := SearchRanked(data, RankedSearchOptions{
		Query:  "al",
		Entity: EntityArtist,
		SortBy: "count",
		Start:  time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
		End:    time.Date(2024, 12, 31, 23, 59, 59, 0, time.UTC),
	})

	if len(results) != 2 {
		t.Fatalf("expected 2 range results, got %d", len(results))
	}

	if results[0].Name != "Alpine" {
		t.Fatalf("expected Alpine ranked first in range, got %s", results[0].Name)
	}

	if results[0].RangeCount != 2 {
		t.Fatalf("expected Alpine rangeCount 2, got %d", results[0].RangeCount)
	}
}

func TestSearchRankedRangeRankIsFilterScopedNotQueryScoped(t *testing.T) {
	inside := time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC)

	data := []parser.MinifiedSongData{
		{Ts: inside, ArtistName: "Alpha", TrackName: "T1", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:1"},
		{Ts: inside, ArtistName: "Alpha", TrackName: "T2", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:2"},
		{Ts: inside, ArtistName: "Beta", TrackName: "T3", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:3"},
		{Ts: inside, ArtistName: "Gamma", TrackName: "T4", MsPlayed: 1000, SpotifyTrackURI: "spotify:track:4"},
	}

	results := SearchRanked(data, RankedSearchOptions{
		Query:  "be",
		Entity: EntityArtist,
		SortBy: "count",
		Start:  time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
		End:    time.Date(2024, 12, 31, 23, 59, 59, 0, time.UTC),
	})

	if len(results) != 1 {
		t.Fatalf("expected 1 query result, got %d", len(results))
	}

	if results[0].Name != "Beta" {
		t.Fatalf("expected Beta result, got %s", results[0].Name)
	}

	if results[0].RangeRank != 2 {
		t.Fatalf("expected Beta global range rank 2, got %d", results[0].RangeRank)
	}
}

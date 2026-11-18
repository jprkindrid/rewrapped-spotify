package summary

import (
	"sort"
	"strings"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ScoredEntry struct {
	Name       string
	TrackName  string
	ArtistName string
	TotalMs    int
	Count      int
	URI        string
}

func TopArtistsInRange(data []parser.MinifiedSongData, start, end time.Time, sortBy string) []ScoredEntry {
	counts := make(map[string]*ScoredEntry)
	reps := make(map[string]string) // artist name -> first found track

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}
		name := entry.ArtistName

		if counts[name] == nil {
			counts[name] = &ScoredEntry{
				Name:       name,
				ArtistName: name,
				URI:        entry.SpotifyTrackURI,
			}

			if reps[name] == "" {
				reps[name] = entry.SpotifyTrackURI
			}
		}

		counts[name].TotalMs += entry.MsPlayed
		counts[name].Count++
	}

	var sorted []ScoredEntry
	for _, v := range counts {
		sorted = append(sorted, *v)
	}
	switch sortBy {
	case constants.SortByCount:
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Count != sorted[j].Count {
				return sorted[i].Count > sorted[j].Count
			}
			return sorted[i].Name < sorted[j].Name
		})
	case constants.SortByTime:
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].TotalMs != sorted[j].TotalMs {
				return sorted[i].TotalMs > sorted[j].TotalMs
			}
			return sorted[i].Name < sorted[j].Name
		})
	}
	return sorted
}

func TopTracksInRange(data []parser.MinifiedSongData, start, end time.Time, sortBy string) []ScoredEntry {
	counts := make(map[string]*ScoredEntry)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}
		key := entry.TrackName + " - " + entry.ArtistName
		if counts[key] == nil {
			counts[key] = &ScoredEntry{
				Name:       key,
				TrackName:  entry.TrackName,
				ArtistName: entry.ArtistName,
				URI:        entry.SpotifyTrackURI,
			}
		}
		counts[key].TotalMs += entry.MsPlayed
		counts[key].Count++
	}

	var sorted []ScoredEntry
	for _, v := range counts {
		sorted = append(sorted, *v)
	}

	switch sortBy {
	case constants.SortByCount:
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Count != sorted[j].Count {
				return sorted[i].Count > sorted[j].Count
			}
			return sorted[i].Name < sorted[j].Name
		})
	case constants.SortByTime:
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].TotalMs != sorted[j].TotalMs {
				return sorted[i].TotalMs > sorted[j].TotalMs
			}
			return sorted[i].Name < sorted[j].Name
		})
	}

	return sorted
}

func FilterArtistsByQuery(entries []ScoredEntry, query string) []ScoredEntry {
	queryLower := strings.ToLower(strings.TrimSpace(query))
	if queryLower == "" {
		return entries
	}

	filtered := make([]ScoredEntry, 0, len(entries))
	for _, entry := range entries {
		artistName := entry.ArtistName
		if artistName == "" {
			artistName = entry.Name
		}

		if strings.Contains(strings.ToLower(artistName), queryLower) {
			filtered = append(filtered, entry)
		}
	}

	return filtered
}

func FilterTracksByQuery(entries []ScoredEntry, query string) []ScoredEntry {
	queryLower := strings.ToLower(strings.TrimSpace(query))
	if queryLower == "" {
		return entries
	}

	filtered := make([]ScoredEntry, 0, len(entries))
	for _, entry := range entries {
		trackName := entry.TrackName
		if trackName == "" {
			trackName = entry.Name
		}

		if strings.Contains(strings.ToLower(trackName), queryLower) {
			filtered = append(filtered, entry)
		}
	}

	return filtered
}

func GroupByYear(data []parser.UserSongData) map[int][]parser.UserSongData {
	byYear := make(map[int][]parser.UserSongData)
	for _, entry := range data {
		year := entry.Ts.Year()
		byYear[year] = append(byYear[year], entry)
	}
	return byYear
}

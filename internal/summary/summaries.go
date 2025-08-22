package summary

import (
	"log/slog"
	"sort"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ScoredEntry struct {
	Name    string
	TotalMs int
	Count   int
}

func TopArtistsInRange(data []parser.MinifiedSongData, start, end time.Time, sortBy string) []ScoredEntry {
	slog.Info("Calculating top artists", "data_count", len(data), "start", start, "end", end, "sort_by", sortBy)
	counts := make(map[string]*ScoredEntry)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}
		name := entry.ArtistName
		if counts[name] == nil {
			counts[name] = &ScoredEntry{Name: name}
		}
		counts[name].TotalMs += entry.MsPlayed
		counts[name].Count++
	}

	var sorted []ScoredEntry
	for _, v := range counts {
		sorted = append(sorted, *v)
	}
	switch sortBy {
	case "count":
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Count != sorted[j].Count {
				return sorted[i].Count > sorted[j].Count
			}
			return sorted[i].Name < sorted[j].Name
		})
	case "time":
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].TotalMs != sorted[j].TotalMs {
				return sorted[i].TotalMs > sorted[j].TotalMs
			}
			return sorted[i].Name < sorted[j].Name
		})
	}
	slog.Info("Top artists calculation completed", "unique_artists", len(sorted))
	return sorted
}

func TopTracksInRange(data []parser.MinifiedSongData, start, end time.Time, sortBy string) []ScoredEntry {
	slog.Info("Calculating top tracks", "data_count", len(data), "start", start, "end", end, "sort_by", sortBy)
	counts := make(map[string]*ScoredEntry)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}
		key := entry.TrackName + " - " + entry.ArtistName
		if counts[key] == nil {
			counts[key] = &ScoredEntry{Name: key}
		}
		counts[key].TotalMs += entry.MsPlayed
		counts[key].Count++
	}

	var sorted []ScoredEntry
	for _, v := range counts {
		sorted = append(sorted, *v)
	}

	switch sortBy {
	case "count":
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Count != sorted[j].Count {
				return sorted[i].Count > sorted[j].Count
			}
			return sorted[i].Name < sorted[j].Name
		})
	case "time":
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].TotalMs != sorted[j].TotalMs {
				return sorted[i].TotalMs > sorted[j].TotalMs
			}
			return sorted[i].Name < sorted[j].Name
		})
	}

	slog.Info("Top tracks calculation completed", "unique_tracks", len(sorted))
	return sorted
}

func GroupByYear(data []parser.UserSongData) map[int][]parser.UserSongData {
	slog.Info("Grouping data by year", "data_count", len(data))
	byYear := make(map[int][]parser.UserSongData)
	for _, entry := range data {
		year := entry.Ts.Year()
		byYear[year] = append(byYear[year], entry)
	}
	slog.Info("Data grouping completed", "year_count", len(byYear))
	return byYear
}

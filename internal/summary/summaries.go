package summary

import (
	"sort"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ScoredEntry struct {
	Name    string
	TotalMs int
	Count   int
}

func TopArtistsInRange(data []parser.UserSongData, start, end time.Time, sortBy string) []ScoredEntry {
	counts := make(map[string]*ScoredEntry)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}
		name := entry.MasterMetadataAlbumArtistName
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
	if sortBy == "count" {
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Count != sorted[j].Count {
				return sorted[i].Count > sorted[j].Count
			}
			return sorted[i].Name < sorted[j].Name
		})
	} else if sortBy == "time" {
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].TotalMs != sorted[j].TotalMs {
				return sorted[i].TotalMs > sorted[j].TotalMs
			}
			return sorted[i].Name < sorted[j].Name
		})
	}
	return sorted
}

func TopTracksInRange(data []parser.UserSongData, start, end time.Time, sortBy string) []ScoredEntry {
	counts := make(map[string]*ScoredEntry)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}
		key := entry.MasterMetadataTrackName + " - " + entry.MasterMetadataAlbumArtistName
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

	if sortBy == "count" {
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Count != sorted[j].Count {
				return sorted[i].Count > sorted[j].Count
			}
			return sorted[i].Name < sorted[j].Name
		})
	} else if sortBy == "time" {
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].TotalMs != sorted[j].TotalMs {
				return sorted[i].TotalMs > sorted[j].TotalMs
			}
			return sorted[i].Name < sorted[j].Name
		})
	}

	return sorted
}

func GroupByYear(data []parser.UserSongData) map[int][]parser.UserSongData {
	byYear := make(map[int][]parser.UserSongData)
	for _, entry := range data {
		year := entry.Ts.Year()
		byYear[year] = append(byYear[year], entry)
	}
	return byYear
}

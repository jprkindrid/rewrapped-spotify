package discovery

import (
	"sort"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type DiscoveryEntry struct {
	Name        string `json:"name"`
	FirstListen string `json:"firstListen"`
	TotalMs     int    `json:"totalMs"`
	Count       int    `json:"count"`
}

const DefaultLimit = 25

func GenerateDiscoveryData(data []parser.MinifiedSongData, start, end time.Time, sortBy string, limit int) []DiscoveryEntry {
	if limit <= 0 {
		limit = DefaultLimit
	}

	type artistStats struct {
		firstListen time.Time
		totalMs     int
		count       int
	}

	statsMap := make(map[string]*artistStats)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		name := entry.ArtistName
		stats, exists := statsMap[name]
		if !exists {
			stats = &artistStats{
				firstListen: entry.Ts,
			}
			statsMap[name] = stats
		}

		if entry.Ts.Before(stats.firstListen) {
			stats.firstListen = entry.Ts
		}
		stats.totalMs += entry.MsPlayed
		stats.count++
	}

	entries := make([]DiscoveryEntry, 0, len(statsMap))
	for name, stats := range statsMap {
		entries = append(entries, DiscoveryEntry{
			Name:        name,
			FirstListen: stats.firstListen.Format("2006-01-02"),
			TotalMs:     stats.totalMs,
			Count:       stats.count,
		})
	}

	// Sort by the chosen metric to find top N
	if sortBy == constants.SortByTime {
		sort.Slice(entries, func(i, j int) bool {
			if entries[i].TotalMs != entries[j].TotalMs {
				return entries[i].TotalMs > entries[j].TotalMs
			}
			return entries[i].Name < entries[j].Name
		})
	} else {
		sort.Slice(entries, func(i, j int) bool {
			if entries[i].Count != entries[j].Count {
				return entries[i].Count > entries[j].Count
			}
			return entries[i].Name < entries[j].Name
		})
	}

	// Take top N
	if len(entries) > limit {
		entries = entries[:limit]
	}

	// Re-sort by first listen date for timeline ordering
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].FirstListen < entries[j].FirstListen
	})

	return entries
}

package discovery

import (
	"sort"
	"strings"
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

	type rankStats struct {
		totalMs int
		count   int
	}

	rankMap := make(map[string]*rankStats)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		name := entry.ArtistName
		stats, exists := rankMap[name]
		if !exists {
			stats = &rankStats{}
			rankMap[name] = stats
		}

		stats.totalMs += entry.MsPlayed
		stats.count++
	}

	type rankedArtist struct {
		name    string
		totalMs int
		count   int
	}

	ranked := make([]rankedArtist, 0, len(rankMap))
	for name, stats := range rankMap {
		ranked = append(ranked, rankedArtist{name: name, totalMs: stats.totalMs, count: stats.count})
	}

	if sortBy == constants.SortByTime {
		sort.Slice(ranked, func(i, j int) bool {
			if ranked[i].totalMs != ranked[j].totalMs {
				return ranked[i].totalMs > ranked[j].totalMs
			}
			return ranked[i].count < ranked[j].count
		})
	} else {
		sort.Slice(ranked, func(i, j int) bool {
			if ranked[i].count != ranked[j].count {
				return ranked[i].count > ranked[j].count
			}
			return ranked[i].totalMs < ranked[j].totalMs
		})
	}

	if len(ranked) > limit {
		ranked = ranked[:limit]
	}

	topNames := make(map[string]struct{}, len(ranked))
	for _, r := range ranked {
		topNames[r.name] = struct{}{}
	}

	// Pass 2: compute all-time stats for the selected artists (no date filter)
	type allTimeStats struct {
		firstListen time.Time
		totalMs     int
		count       int
	}

	allTimeMap := make(map[string]*allTimeStats, len(topNames))

	for _, entry := range data {
		if _, ok := topNames[entry.ArtistName]; !ok {
			continue
		}

		name := entry.ArtistName
		stats, exists := allTimeMap[name]
		if !exists {
			stats = &allTimeStats{
				firstListen: entry.Ts,
			}
			allTimeMap[name] = stats
		}

		if entry.Ts.Before(stats.firstListen) {
			stats.firstListen = entry.Ts
		}
		stats.totalMs += entry.MsPlayed
		stats.count++
	}

	entries := make([]DiscoveryEntry, 0, len(allTimeMap))
	for name, stats := range allTimeMap {
		entries = append(entries, DiscoveryEntry{
			Name:        name,
			FirstListen: stats.firstListen.Format("2006-01-02"),
			TotalMs:     stats.totalMs,
			Count:       stats.count,
		})
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].FirstListen < entries[j].FirstListen
	})

	return entries
}

type DiscoverySearchEntry struct {
	Name        string `json:"name"`
	FirstListen string `json:"firstListen"`
	TotalMs     int    `json:"totalMs"`
	Count       int    `json:"count"`
	URI         string `json:"uri"`
}

const DefaultSearchLimit = 10

func SearchArtistDiscovery(data []parser.MinifiedSongData, query string, limit int) []DiscoverySearchEntry {
	if limit <= 0 {
		limit = DefaultSearchLimit
	}

	queryLower := strings.ToLower(strings.TrimSpace(query))
	if queryLower == "" {
		return []DiscoverySearchEntry{}
	}

	type artistStats struct {
		firstListen time.Time
		totalMs     int
		count       int
		trackURI    string
	}

	statsMap := make(map[string]*artistStats)

	for _, entry := range data {
		name := entry.ArtistName
		stats, exists := statsMap[name]
		if !exists {
			stats = &artistStats{
				firstListen: entry.Ts,
				trackURI:    entry.SpotifyTrackURI,
			}
			statsMap[name] = stats
		}

		if entry.Ts.Before(stats.firstListen) {
			stats.firstListen = entry.Ts
		}
		stats.totalMs += entry.MsPlayed
		stats.count++
	}

	// Filter by query and build results
	results := make([]DiscoverySearchEntry, 0)
	for name, stats := range statsMap {
		nameLower := strings.ToLower(name)
		if !strings.Contains(nameLower, queryLower) {
			continue
		}

		results = append(results, DiscoverySearchEntry{
			Name:        name,
			FirstListen: stats.firstListen.Format("2006-01-02"),
			TotalMs:     stats.totalMs,
			Count:       stats.count,
			URI:         stats.trackURI,
		})
	}

	// Sort: exact prefix matches first, then by play count descending
	sort.Slice(results, func(i, j int) bool {
		iPrefix := strings.HasPrefix(strings.ToLower(results[i].Name), queryLower)
		jPrefix := strings.HasPrefix(strings.ToLower(results[j].Name), queryLower)

		if iPrefix != jPrefix {
			return iPrefix
		}
		if results[i].Count != results[j].Count {
			return results[i].Count > results[j].Count
		}
		return results[i].Name < results[j].Name
	})

	if len(results) > limit {
		results = results[:limit]
	}

	return results
}

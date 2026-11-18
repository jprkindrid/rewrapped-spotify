package search

import (
	"sort"
	"strings"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

const (
	EntityArtist = "artist"
	EntityTrack  = "track"
)

const DefaultSearchLimit = 10

type RankedSearchOptions struct {
	Query  string
	Entity string
	SortBy string
	Start  time.Time
	End    time.Time
	Limit  int
	Offset int
}

type RankedSearchEntry struct {
	Name         string `json:"name"`
	TrackName    string `json:"trackName,omitempty"`
	ArtistName   string `json:"artistName,omitempty"`
	FirstListen  string `json:"firstListen"`
	TotalMs      int    `json:"totalMs"`
	Count        int    `json:"count"`
	URI          string `json:"uri"`
	RangeCount   int    `json:"rangeCount"`
	RangeTotalMs int    `json:"rangeTotalMs"`
	RangeRank    int    `json:"rangeRank"`
	Entity       string `json:"entity"`
}

type rankedStats struct {
	name         string
	trackName    string
	artistName   string
	firstListen  time.Time
	totalMs      int
	count        int
	uri          string
	rangeCount   int
	rangeTotalMs int
}

func NormalizeEntity(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "track", "tracks":
		return EntityTrack
	default:
		return EntityArtist
	}
}

func SearchRanked(data []parser.MinifiedSongData, opts RankedSearchOptions) []RankedSearchEntry {
	query := strings.ToLower(strings.TrimSpace(opts.Query))
	if query == "" {
		return []RankedSearchEntry{}
	}

	entity := NormalizeEntity(opts.Entity)
	limit := opts.Limit
	if limit <= 0 {
		limit = DefaultSearchLimit
	}
	if limit > constants.MaxLimit {
		limit = constants.MaxLimit
	}
	offset := max(opts.Offset, 0)

	useRange := !opts.Start.IsZero() && !opts.End.IsZero()
	if useRange && opts.Start.After(opts.End) {
		return []RankedSearchEntry{}
	}

	statsByKey := make(map[string]*rankedStats)

	for _, entry := range data {
		key, _, name, trackName, artistName, uri := fieldsForEntity(entry, entity)
		if key == "" {
			continue
		}

		stats, exists := statsByKey[key]
		if !exists {
			stats = &rankedStats{
				name:        name,
				trackName:   trackName,
				artistName:  artistName,
				firstListen: entry.Ts,
				uri:         uri,
			}
			statsByKey[key] = stats
		}

		if entry.Ts.Before(stats.firstListen) {
			stats.firstListen = entry.Ts
		}

		stats.totalMs += entry.MsPlayed
		stats.count++

		if useRange && !entry.Ts.Before(opts.Start) && !entry.Ts.After(opts.End) {
			stats.rangeCount++
			stats.rangeTotalMs += entry.MsPlayed
		}
	}

	entries := make([]RankedSearchEntry, 0, len(statsByKey))
	for _, stats := range statsByKey {
		if useRange && stats.rangeCount == 0 {
			continue
		}

		entries = append(entries, RankedSearchEntry{
			Name:         stats.name,
			TrackName:    stats.trackName,
			ArtistName:   stats.artistName,
			FirstListen:  stats.firstListen.Format("2006-01-02"),
			TotalMs:      stats.totalMs,
			Count:        stats.count,
			URI:          stats.uri,
			RangeCount:   stats.rangeCount,
			RangeTotalMs: stats.rangeTotalMs,
			Entity:       entity,
		})
	}

	sortBy := opts.SortBy
	if sortBy != constants.SortByTime {
		sortBy = constants.SortByCount
	}

	rankSorted := make([]RankedSearchEntry, len(entries))
	copy(rankSorted, entries)

	sort.Slice(rankSorted, func(i, j int) bool {
		iMetric := metricForSort(rankSorted[i], sortBy, useRange)
		jMetric := metricForSort(rankSorted[j], sortBy, useRange)
		if iMetric != jMetric {
			return iMetric > jMetric
		}
		return strings.ToLower(rankSorted[i].Name) < strings.ToLower(rankSorted[j].Name)
	})

	rankByKey := make(map[string]int, len(rankSorted))
	for i, item := range rankSorted {
		rankByKey[item.Entity+"::"+item.Name+"::"+item.ArtistName] = i + 1
	}

	matchedEntries := make([]RankedSearchEntry, 0, len(entries))
	for _, entry := range entries {
		matchField := entry.Name
		if entry.Entity == EntityTrack && entry.TrackName != "" {
			matchField = entry.TrackName
		}

		if strings.Contains(strings.ToLower(matchField), query) {
			matchedEntries = append(matchedEntries, entry)
		}
	}

	sort.Slice(matchedEntries, func(i, j int) bool {
		iPrefix := prefixMatch(matchedEntries[i], query)
		jPrefix := prefixMatch(matchedEntries[j], query)
		if iPrefix != jPrefix {
			return iPrefix
		}

		iMetric := metricForSort(matchedEntries[i], sortBy, useRange)
		jMetric := metricForSort(matchedEntries[j], sortBy, useRange)
		if iMetric != jMetric {
			return iMetric > jMetric
		}
		return strings.ToLower(matchedEntries[i].Name) < strings.ToLower(matchedEntries[j].Name)
	})

	for i := range matchedEntries {
		matchedEntries[i].RangeRank = rankByKey[matchedEntries[i].Entity+"::"+matchedEntries[i].Name+"::"+matchedEntries[i].ArtistName]
	}

	if offset >= len(matchedEntries) {
		return []RankedSearchEntry{}
	}

	end := min(offset+limit, len(matchedEntries))

	return matchedEntries[offset:end]
}

func fieldsForEntity(entry parser.MinifiedSongData, entity string) (key, matchField, name, trackName, artistName, uri string) {
	if entity == EntityTrack {
		key = strings.ToLower(entry.TrackName + "\x00" + entry.ArtistName)
		matchField = entry.TrackName
		name = entry.TrackName
		trackName = entry.TrackName
		artistName = entry.ArtistName
		uri = entry.SpotifyTrackURI
		return
	}

	key = strings.ToLower(entry.ArtistName)
	matchField = entry.ArtistName
	name = entry.ArtistName
	artistName = entry.ArtistName
	uri = entry.SpotifyTrackURI
	return
}

func metricForSort(entry RankedSearchEntry, sortBy string, useRange bool) int {
	if useRange {
		if sortBy == constants.SortByTime {
			return entry.RangeTotalMs
		}
		return entry.RangeCount
	}

	if sortBy == constants.SortByTime {
		return entry.TotalMs
	}
	return entry.Count
}

func prefixMatch(entry RankedSearchEntry, queryLower string) bool {
	if entry.Entity == EntityTrack {
		return strings.HasPrefix(strings.ToLower(entry.TrackName), queryLower)
	}
	return strings.HasPrefix(strings.ToLower(entry.Name), queryLower)
}

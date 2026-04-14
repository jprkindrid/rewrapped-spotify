package diversity

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type DiversityEntry struct {
	Period        string `json:"period"`
	UniqueArtists int    `json:"uniqueArtists"`
	UniqueTracks  int    `json:"uniqueTracks"`
}

func GenerateDiversityData(data []parser.MinifiedSongData, start, end time.Time, interval string) []DiversityEntry {
	if interval == constants.IntervalDaily {
		maxStart := end.AddDate(0, 0, -365)
		if start.Before(maxStart) {
			start = maxStart
		}
	}

	periods := generateTimePeriods(start, end, interval)

	type periodSets struct {
		artists map[string]struct{}
		tracks  map[string]struct{}
	}

	periodData := make(map[string]*periodSets)
	for _, period := range periods {
		periodData[period] = &periodSets{
			artists: make(map[string]struct{}),
			tracks:  make(map[string]struct{}),
		}
	}

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		period := getPeriodKey(entry.Ts, interval)
		sets, ok := periodData[period]
		if !ok {
			continue
		}

		sets.artists[entry.ArtistName] = struct{}{}
		trackKey := entry.TrackName + " - " + entry.ArtistName
		sets.tracks[trackKey] = struct{}{}
	}

	result := make([]DiversityEntry, 0, len(periods))
	for _, period := range periods {
		sets := periodData[period]
		if len(sets.artists) > 0 || len(sets.tracks) > 0 {
			result = append(result, DiversityEntry{
				Period:        period,
				UniqueArtists: len(sets.artists),
				UniqueTracks:  len(sets.tracks),
			})
		}
	}

	return result
}

func getPeriodKey(t time.Time, interval string) string {
	switch interval {
	case constants.IntervalDaily:
		return t.Format("2006-1-2")
	case constants.IntervalMonthly:
		return t.Format("2006-1")
	default:
		return t.Format("2006")
	}
}

func generateTimePeriods(start, end time.Time, interval string) []string {
	switch interval {
	case constants.IntervalDaily:
		start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())
	case constants.IntervalMonthly:
		start = time.Date(start.Year(), start.Month(), 1, 0, 0, 0, 0, start.Location())
	default:
		start = time.Date(start.Year(), 1, 1, 0, 0, 0, 0, start.Location())
	}

	var periods []string
	current := start

	for !current.After(end) {
		switch interval {
		case constants.IntervalDaily:
			periods = append(periods, current.Format("2006-1-2"))
			current = current.AddDate(0, 0, 1)
		case constants.IntervalMonthly:
			periods = append(periods, current.Format("2006-1"))
			current = current.AddDate(0, 1, 0)
		default:
			periods = append(periods, current.Format("2006"))
			current = current.AddDate(1, 0, 0)
		}
	}

	return periods
}

package bump

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
)

type ScoredEntry struct {
	URI      string     `json:"uri"`
	Name     string     `json:"name"`
	Timeline []BumpData `json:"timeline"`
}

type BumpData struct {
	Period string `json:"period"`
	Rank   int    `json:"rank"`
}

const TopN = 10

func GenerateBumpData(data []parser.MinifiedSongData, start, end time.Time, interval string, sortBy string, isTracks bool) []ScoredEntry {
	periods := generateTimePeriods(start, end, interval)
	entryMap := make(map[string]*ScoredEntry)

	for _, period := range periods {
		periodStart, periodEnd := timePeriodBounds(period, interval)
		var topEntries []summary.ScoredEntry
		if isTracks {
			topEntries = summary.TopTracksInRange(data, periodStart, periodEnd, sortBy)
		} else {
			topEntries = summary.TopArtistsInRange(data, periodStart, periodEnd, sortBy)

		}

		for rank, entry := range topEntries {
			if rank >= TopN {
				break
			}

			scored, exists := entryMap[entry.URI]
			if !exists {
				scored = &ScoredEntry{
					URI:      entry.URI,
					Name:     entry.Name,
					Timeline: []BumpData{},
				}
				entryMap[entry.URI] = scored
			}

			scored.Timeline = append(scored.Timeline, BumpData{
				Period: period,
				Rank:   rank + 1,
			})
		}
	}

	result := make([]ScoredEntry, 0, len(entryMap))
	for _, entry := range entryMap {
		result = append(result, *entry)
	}
	return result
}

func generateTimePeriods(start, end time.Time, interval string) []string {

	if interval == constants.IntervalMonthly {
		start = time.Date(start.Year(), start.Month(), 1, 0, 0, 0, 0, start.Location())
	} else {
		start = time.Date(start.Year(), 1, 1, 0, 0, 0, 0, start.Location())
	}

	var periods []string

	current := start
	for !current.After(end) {
		if interval == constants.IntervalMonthly {
			periods = append(periods, current.Format("2006-1"))
			current = current.AddDate(0, 1, 0)
		} else {
			periods = append(periods, current.Format("2006"))
			current = current.AddDate(1, 0, 0)
		}
	}

	return periods
}

func timePeriodBounds(period string, interval string) (time.Time, time.Time) {
	var start time.Time

	if interval == constants.IntervalMonthly {
		start, _ = time.Parse("2006-1", period)
		end := start.AddDate(0, 1, 0).Add(-time.Second)
		return start, end
	}

	start, _ = time.Parse("2006", period)
	end := start.AddDate(1, 0, 0).Add(-time.Second)
	return start, end
}

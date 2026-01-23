package listeningtime

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ListeningTimeEntry struct {
	Period  string `json:"period"`
	TotalMs int64  `json:"totalMs"`
}

const (
	MaxDailyDays   = 365
	MaxMonthlyDays = 24 // months, not days
)

func GenerateListeningTimeData(data []parser.MinifiedSongData, start, end time.Time, interval string) []ListeningTimeEntry {
	if interval == constants.IntervalDaily {
		maxStart := end.AddDate(0, 0, -MaxDailyDays)
		if start.Before(maxStart) {
			start = maxStart
		}
	}

	periods := generateTimePeriods(start, end, interval)
	periodTotals := make(map[string]int64)

	for _, period := range periods {
		periodTotals[period] = 0
	}

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		period := getPeriodKey(entry.Ts, interval)
		periodTotals[period] += int64(entry.MsPlayed)
	}

	result := make([]ListeningTimeEntry, 0, len(periods))
	for _, period := range periods {
		total := periodTotals[period]
		if total > 0 {
			result = append(result, ListeningTimeEntry{
				Period:  period,
				TotalMs: total,
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
	default: // yearly
		return t.Format("2006")
	}
}

func generateTimePeriods(start, end time.Time, interval string) []string {
	switch interval {
	case constants.IntervalDaily:
		start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())
	case constants.IntervalMonthly:
		start = time.Date(start.Year(), start.Month(), 1, 0, 0, 0, 0, start.Location())
	default: // yearly
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
		default: // yearly
			periods = append(periods, current.Format("2006"))
			current = current.AddDate(1, 0, 0)
		}
	}

	return periods
}

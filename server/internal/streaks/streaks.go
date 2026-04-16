package streaks

import (
	"sort"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type CalendarEntry struct {
	Day   string `json:"day"`
	Value int64  `json:"value"`
}

type StreaksResponse struct {
	Calendar        []CalendarEntry `json:"calendar"`
	LongestStreak   int             `json:"longestStreak"`
	CurrentStreak   int             `json:"currentStreak"`
	TotalActiveDays int             `json:"totalActiveDays"`
}

func GenerateStreaksData(data []parser.MinifiedSongData, start, end time.Time) StreaksResponse {
	dayTotals := make(map[string]int64)

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		day := entry.Ts.Format("2006-01-02")
		dayTotals[day] += int64(entry.MsPlayed)
	}

	// Build calendar entries
	calendar := make([]CalendarEntry, 0, len(dayTotals))
	for day, total := range dayTotals {
		calendar = append(calendar, CalendarEntry{
			Day:   day,
			Value: total,
		})
	}

	sort.Slice(calendar, func(i, j int) bool {
		return calendar[i].Day < calendar[j].Day
	})

	// Compute streaks
	longestStreak, currentStreak := computeStreaks(calendar)

	return StreaksResponse{
		Calendar:        calendar,
		LongestStreak:   longestStreak,
		CurrentStreak:   currentStreak,
		TotalActiveDays: len(calendar),
	}
}

func computeStreaks(sortedCalendar []CalendarEntry) (longest, current int) {
	if len(sortedCalendar) == 0 {
		return 0, 0
	}

	longest = 1
	currentRun := 1

	for i := 1; i < len(sortedCalendar); i++ {
		prevDate, err1 := time.Parse("2006-01-02", sortedCalendar[i-1].Day)
		currDate, err2 := time.Parse("2006-01-02", sortedCalendar[i].Day)
		if err1 != nil || err2 != nil {
			currentRun = 1
			continue
		}

		diff := currDate.Sub(prevDate).Hours() / 24
		if diff == 1 {
			currentRun++
		} else {
			currentRun = 1
		}

		if currentRun > longest {
			longest = currentRun
		}
	}

	// Current streak: always count backwards from the most recent input day.
	current = 1
	for i := len(sortedCalendar) - 1; i >= 1; i-- {
		prevDate, err1 := time.Parse("2006-01-02", sortedCalendar[i-1].Day)
		currDate, err2 := time.Parse("2006-01-02", sortedCalendar[i].Day)
		if err1 != nil || err2 != nil {
			break
		}

		diff := currDate.Sub(prevDate).Hours() / 24
		if diff == 1 {
			current++
		} else {
			break
		}
	}

	return longest, current
}

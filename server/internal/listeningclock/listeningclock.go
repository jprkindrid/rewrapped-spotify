package listeningclock

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ClockEntry struct {
	Timestamp string `json:"timestamp"`
	TotalMs   int64  `json:"totalMs"`
}

type clockBucket struct {
	totalMs   int64
	firstTime time.Time
}

func GenerateListeningClockData(data []parser.MinifiedSongData, start, end time.Time) []ClockEntry {
	// 7 days x 24 hours grid, track both total and first timestamp
	grid := [7][24]*clockBucket{}

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		weekday := int(entry.Ts.Weekday())
		hour := entry.Ts.Hour()

		if grid[weekday][hour] == nil {
			grid[weekday][hour] = &clockBucket{
				totalMs:   int64(entry.MsPlayed),
				firstTime: entry.Ts,
			}
		} else {
			grid[weekday][hour].totalMs += int64(entry.MsPlayed)
			if entry.Ts.Before(grid[weekday][hour].firstTime) {
				grid[weekday][hour].firstTime = entry.Ts
			}
		}
	}

	result := make([]ClockEntry, 0, 7*24)
	for day := range 7 {
		for hour := range 24 {
			if grid[day][hour] != nil {
				result = append(result, ClockEntry{
					Timestamp: grid[day][hour].firstTime.UTC().Format(time.RFC3339),
					TotalMs:   grid[day][hour].totalMs,
				})
			} else {
				baseBucketTime := time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC) // Sunday at 00:00 UTC
				bucketTime := baseBucketTime.AddDate(0, 0, day).Add(time.Duration(hour) * time.Hour)
				result = append(result, ClockEntry{
					Timestamp: bucketTime.Format(time.RFC3339),
					TotalMs:   0,
				})
			}
		}
	}

	return result
}

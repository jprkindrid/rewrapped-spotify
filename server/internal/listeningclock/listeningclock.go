package listeningclock

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ClockEntry struct {
	Timestamp string `json:"timestamp"`
	TotalMs   int64  `json:"totalMs"`
}

var dayNames = [7]string{
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
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

		weekday := int(entry.Ts.Weekday()) // 0 = Sunday
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
	for day := 0; day < 7; day++ {
		for hour := 0; hour < 24; hour++ {
			if grid[day][hour] != nil {
				result = append(result, ClockEntry{
					Timestamp: grid[day][hour].firstTime.UTC().Format(time.RFC3339),
					TotalMs:   grid[day][hour].totalMs,
				})
			} else {
				// For empty buckets, use a representative time (midnight of that day in UTC)
				representativeTime := time.Date(2000, 1, 2+day, hour, 0, 0, 0, time.UTC)
				result = append(result, ClockEntry{
					Timestamp: representativeTime.Format(time.RFC3339),
					TotalMs:   0,
				})
			}
		}
	}

	return result
}

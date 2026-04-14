package listeningclock

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

type ClockEntry struct {
	Day     string `json:"day"`
	Hour    int    `json:"hour"`
	TotalMs int64  `json:"totalMs"`
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

func GenerateListeningClockData(data []parser.MinifiedSongData, start, end time.Time) []ClockEntry {
	// 7 days x 24 hours grid
	grid := [7][24]int64{}

	for _, entry := range data {
		if entry.Ts.Before(start) || entry.Ts.After(end) {
			continue
		}

		weekday := int(entry.Ts.Weekday()) // 0 = Sunday
		hour := entry.Ts.Hour()
		grid[weekday][hour] += int64(entry.MsPlayed)
	}

	result := make([]ClockEntry, 0, 7*24)
	for day := 0; day < 7; day++ {
		for hour := 0; hour < 24; hour++ {
			result = append(result, ClockEntry{
				Day:     dayNames[day],
				Hour:    hour,
				TotalMs: grid[day][hour],
			})
		}
	}

	return result
}

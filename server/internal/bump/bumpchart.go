package bump

import (
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
)

type ScoredEntry struct {
	uri  string
	name string
	data []BumpData
}

type BumpData struct {
	term     time.Time
	position int
}

func SummaryToBump(entries []summary.ScoredEntry) []ScoredEntry {
	return []ScoredEntry{}
}

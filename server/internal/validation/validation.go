package validation

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
)

type ValidationError struct {
	Field   string
	Message string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("validation error for field '%s': %s", e.Field, e.Message)
}

type PaginationParams struct {
	OffsetTracks  int
	OffsetArtists int
	Limit         int
}

type TimeRangeParams struct {
	Start time.Time
	End   time.Time
}

type SortParams struct {
	SortBy string
}

type IntervalParams struct {
	Interval string
}

func ValidatePaginationParams(r *http.Request) (*PaginationParams, error) {
	offsetTrackStr := r.URL.Query().Get("offset_tracks")
	offsetArtistStr := r.URL.Query().Get("offset_artists")
	limitStr := r.URL.Query().Get("limit")

	params := &PaginationParams{}
	var err error

	if offsetTrackStr != "" {
		params.OffsetTracks, err = strconv.Atoi(offsetTrackStr)
		if err != nil {
			return nil, ValidationError{Field: "offset_tracks", Message: "must be a valid integer"}
		}
		if params.OffsetTracks < 0 {
			return nil, ValidationError{Field: "offset_tracks", Message: "must be non-negative"}
		}
	}

	if offsetArtistStr != "" {
		params.OffsetArtists, err = strconv.Atoi(offsetArtistStr)
		if err != nil {
			return nil, ValidationError{Field: "offset_artists", Message: "must be a valid integer"}
		}
		if params.OffsetArtists < 0 {
			return nil, ValidationError{Field: "offset_artists", Message: "must be non-negative"}
		}
	}

	if limitStr != "" {
		params.Limit, err = strconv.Atoi(limitStr)
		if err != nil {
			return nil, ValidationError{Field: "limit", Message: "must be a valid integer"}
		}
		if params.Limit <= 0 || params.Limit > constants.MaxLimit {
			return nil, ValidationError{Field: "limit", Message: fmt.Sprintf("must be between %d and %d", constants.MinLimit, constants.MaxLimit)}
		}
	} else {
		params.Limit = constants.DefaultLimit
	}

	return params, nil
}

func ValidateTimeRange(r *http.Request) (*TimeRangeParams, error) {
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")

	params := &TimeRangeParams{}
	var err error

	if startStr == "" {
		params.Start = time.Time{}
	} else {
		params.Start, err = time.Parse(time.RFC3339, startStr)
		if err != nil {
			return nil, ValidationError{Field: "start", Message: "invalid datetime format, use RFC3339"}
		}
	}

	if endStr == "" {
		params.End = time.Now()
	} else {
		params.End, err = time.Parse(time.RFC3339, endStr)
		if err != nil {
			return nil, ValidationError{Field: "end", Message: "invalid datetime format, use RFC3339"}
		}
	}

	if !params.Start.IsZero() && params.Start.After(params.End) {
		return nil, ValidationError{Field: "start", Message: "start time must be before end time"}
	}

	return params, nil
}

func ValidateSortParam(r *http.Request) *SortParams {
	sortBy := r.URL.Query().Get("sort_by")

	if sortBy != constants.SortByTime && sortBy != constants.SortByCount {
		sortBy = constants.SortByCount
	}

	return &SortParams{
		SortBy: sortBy,
	}
}

func ValidateIntervalParam(r *http.Request) *IntervalParams {
	interval := r.URL.Query().Get("interval")

	if interval != constants.IntervalDaily && interval != constants.IntervalMonthly && interval != constants.IntervalYearly {
		interval = constants.IntervalMonthly
	}

	return &IntervalParams{
		Interval: interval,
	}
}

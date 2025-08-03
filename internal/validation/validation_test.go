package validation

import (
	"net/http"
	"net/url"
	"testing"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
)

func TestValidatePaginationParams(t *testing.T) {
	tests := []struct {
		name        string
		query       url.Values
		expected    *PaginationParams
		expectError bool
		errorField  string
	}{
		{
			name:  "valid parameters",
			query: url.Values{"offset_tracks": {"10"}, "offset_artists": {"5"}, "limit": {"20"}},
			expected: &PaginationParams{
				OffsetTracks:  10,
				OffsetArtists: 5,
				Limit:         20,
			},
			expectError: false,
		},
		{
			name:  "default values when empty",
			query: url.Values{},
			expected: &PaginationParams{
				OffsetTracks:  0,
				OffsetArtists: 0,
				Limit:         constants.DefaultLimit,
			},
			expectError: false,
		},
		{
			name:        "invalid offset_tracks",
			query:       url.Values{"offset_tracks": {"invalid"}},
			expectError: true,
			errorField:  "offset_tracks",
		},
		{
			name:        "negative offset_tracks",
			query:       url.Values{"offset_tracks": {"-1"}},
			expectError: true,
			errorField:  "offset_tracks",
		},
		{
			name:        "invalid limit",
			query:       url.Values{"limit": {"invalid"}},
			expectError: true,
			errorField:  "limit",
		},
		{
			name:        "limit too large",
			query:       url.Values{"limit": {"2000"}},
			expectError: true,
			errorField:  "limit",
		},
		{
			name:        "limit too small",
			query:       url.Values{"limit": {"0"}},
			expectError: true,
			errorField:  "limit",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &http.Request{URL: &url.URL{RawQuery: tt.query.Encode()}}

			result, err := ValidatePaginationParams(req)

			if tt.expectError {
				if err == nil {
					t.Errorf("expected error but got none")
					return
				}
				if validationErr, ok := err.(ValidationError); ok {
					if validationErr.Field != tt.errorField {
						t.Errorf("expected error field %s, got %s", tt.errorField, validationErr.Field)
					}
				} else {
					t.Errorf("expected ValidationError, got %T", err)
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}

			if result.OffsetTracks != tt.expected.OffsetTracks {
				t.Errorf("expected OffsetTracks %d, got %d", tt.expected.OffsetTracks, result.OffsetTracks)
			}
			if result.OffsetArtists != tt.expected.OffsetArtists {
				t.Errorf("expected OffsetArtists %d, got %d", tt.expected.OffsetArtists, result.OffsetArtists)
			}
			if result.Limit != tt.expected.Limit {
				t.Errorf("expected Limit %d, got %d", tt.expected.Limit, result.Limit)
			}
		})
	}
}

func TestValidateTimeRange(t *testing.T) {
	tests := []struct {
		name        string
		query       url.Values
		expectError bool
		errorField  string
	}{
		{
			name:        "valid time range",
			query:       url.Values{"start": {"2023-01-01T00:00:00Z"}, "end": {"2023-12-31T23:59:59Z"}},
			expectError: false,
		},
		{
			name:        "empty values (should use defaults)",
			query:       url.Values{},
			expectError: false,
		},
		{
			name:        "invalid start time format",
			query:       url.Values{"start": {"invalid-time"}},
			expectError: true,
			errorField:  "start",
		},
		{
			name:        "invalid end time format",
			query:       url.Values{"end": {"invalid-time"}},
			expectError: true,
			errorField:  "end",
		},
		{
			name:        "start after end",
			query:       url.Values{"start": {"2023-12-31T23:59:59Z"}, "end": {"2023-01-01T00:00:00Z"}},
			expectError: true,
			errorField:  "start",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &http.Request{URL: &url.URL{RawQuery: tt.query.Encode()}}

			result, err := ValidateTimeRange(req)

			if tt.expectError {
				if err == nil {
					t.Errorf("expected error but got none")
					return
				}
				if validationErr, ok := err.(ValidationError); ok {
					if validationErr.Field != tt.errorField {
						t.Errorf("expected error field %s, got %s", tt.errorField, validationErr.Field)
					}
				}
				return
			}

			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}

			if result == nil {
				t.Errorf("expected result but got nil")
			}
		})
	}
}

func TestValidateSortParams(t *testing.T) {
	tests := []struct {
		name     string
		query    url.Values
		expected *SortParams
	}{
		{
			name:  "valid sort params",
			query: url.Values{"sort_by_artists": {"time"}, "sort_by_tracks": {"count"}},
			expected: &SortParams{
				SortByArtists: constants.SortByTime,
				SortByTracks:  constants.SortByCount,
			},
		},
		{
			name:  "empty values use defaults",
			query: url.Values{},
			expected: &SortParams{
				SortByArtists: constants.DefaultSortBy,
				SortByTracks:  constants.DefaultSortBy,
			},
		},
		{
			name:  "invalid values use defaults",
			query: url.Values{"sort_by_artists": {"invalid"}, "sort_by_tracks": {"invalid"}},
			expected: &SortParams{
				SortByArtists: constants.DefaultSortBy,
				SortByTracks:  constants.DefaultSortBy,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &http.Request{URL: &url.URL{RawQuery: tt.query.Encode()}}

			result := ValidateSortParams(req)

			if result.SortByArtists != tt.expected.SortByArtists {
				t.Errorf("expected SortByArtists %s, got %s", tt.expected.SortByArtists, result.SortByArtists)
			}
			if result.SortByTracks != tt.expected.SortByTracks {
				t.Errorf("expected SortByTracks %s, got %s", tt.expected.SortByTracks, result.SortByTracks)
			}
		})
	}
}

package spotify

// ---------- Shared Types ----------

type ExternalURL struct {
	Spotify string `json:"spotify"`
}

type Image struct {
	Height int    `json:"height"`
	URL    string `json:"url"`
	Width  int    `json:"width"`
}

type Followers struct {
	Href  string `json:"href"`
	Total int    `json:"total"`
}

type ExternalIDs struct {
	Isrc string `json:"isrc,omitempty"`
	Ean  string `json:"ean,omitempty"`
	Upc  string `json:"upc,omitempty"`
}

type Artist struct {
	ExternalUrls ExternalURL `json:"external_urls"`
	Followers    Followers   `json:"followers"`
	Genres       []string    `json:"genres"`
	Href         string      `json:"href"`
	ID           string      `json:"id"`
	Images       []Image     `json:"images"`
	Name         string      `json:"name"`
	Popularity   int         `json:"popularity"`
	Type         string      `json:"type"`
	URI          string      `json:"uri"`
}

type MultiArtist struct {
	Artists []Artist `json:"artists"`
}

func (m *MultiArtist) ToArtists() []Artist {
	if len(m.Artists) == 0 {
		return nil
	}
	artists := make([]Artist, len(m.Artists))
	copy(artists, m.Artists)
	return artists
}

type TrackAlbum struct {
	AlbumType            string      `json:"album_type"`
	Artists              []Artist    `json:"artists"`
	AvailableMarkets     []string    `json:"available_markets"`
	ExternalUrls         ExternalURL `json:"external_urls"`
	Href                 string      `json:"href"`
	ID                   string      `json:"id"`
	Images               []Image     `json:"images"`
	Name                 string      `json:"name"`
	ReleaseDate          string      `json:"release_date"`
	ReleaseDatePrecision string      `json:"release_date_precision"`
	TotalTracks          int         `json:"total_tracks"`
	Type                 string      `json:"type"`
	URI                  string      `json:"uri"`
}

type Track struct {
	Album            TrackAlbum  `json:"album"`
	Artists          []Artist    `json:"artists"`
	AvailableMarkets []string    `json:"available_markets"`
	DiscNumber       int         `json:"disc_number"`
	DurationMs       int         `json:"duration_ms"`
	Explicit         bool        `json:"explicit"`
	ExternalIds      ExternalIDs `json:"external_ids"`
	ExternalUrls     ExternalURL `json:"external_urls"`
	Href             string      `json:"href"`
	ID               string      `json:"id"`
	IsLocal          bool        `json:"is_local"`
	Name             string      `json:"name"`
	Popularity       int         `json:"popularity"`
	PreviewURL       string      `json:"preview_url"`
	TrackNumber      int         `json:"track_number"`
	Type             string      `json:"type"`
	URI              string      `json:"uri"`
}

type MultiTrack struct {
	Tracks []Track `json:"tracks"`
}

func (m *MultiTrack) ToTracks() []Track {
	if len(m.Tracks) == 0 {
		return nil
	}
	tracks := make([]Track, len(m.Tracks))
	copy(tracks, m.Tracks)
	return tracks
}

export interface SummmaryResponse {
    offset_artists: number;
    offset_tracks: number;
    limit: number;
    total_artists_count: number;
    total_tracks_count: number;
    top_artists: SummaryEntry[];
    top_tracks: SummaryEntry[];
    total_time_listening: number;
}

export interface SummaryParams extends OffsetLimit {
    start: Date;
    end: Date;
    sortByTracks: "time" | "count";
    sortByArtists: "time" | "count";
}

export interface OffsetLimit {
    offsetTracks: number;
    offsetArtists: number;
    limit: number;
}

export interface SummaryEntry {
    Name: string;
    TotalMs: number;
    Count: number;
    id: string;
    imageUrl: string;
}

export type SummarySortBy = "time" | "count";

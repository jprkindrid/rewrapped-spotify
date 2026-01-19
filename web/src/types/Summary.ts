import type { DateRange } from "react-day-picker";

export interface SummaryResponse {
    offset_artists: number;
    offset_tracks: number;
    limit: number;
    total_artists_count: number;
    total_tracks_count: number;
    top_artists: SummaryEntry[];
    top_tracks: SummaryEntry[];
    total_time_listening: number;
}

export interface SummaryEntry {
    Name: string;
    TotalMs: number;
    Count: number;
    URI: string;
}

export interface OffsetLimit {
    offsetTracks: number;
    offsetArtists: number;
    limit: number;
}

export interface SummaryParams extends OffsetLimit {
    start: Date;
    end: Date;
    sortBy: SummarySortBy;
    token: string;
    demo: boolean;
}

export interface SummaryMetaParams {
    type: string;
    items: SummaryEntry[];
    token: string;
    demo: boolean;
}

export interface SummaryMetaEntry {
    ItemURL: string;
    ImageURL: string;
}

export type SummaryFilters = {
    range: DateRange | undefined;
    sortBy: SummarySortBy;
    offsetLimit: OffsetLimit;
};

export type SummarySortBy = "time" | "count";
export type SummaryDisplay = "artists" | "tracks";

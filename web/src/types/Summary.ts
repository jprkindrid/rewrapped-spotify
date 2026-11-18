import type { DateRange } from "react-day-picker";
import type { OffsetLimit, SortBy } from "./Shared";

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

export interface SummaryParams extends OffsetLimit {
    start: Date;
    end: Date;
    sortBy: SortBy;
    query?: string;
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

export type SummarySearchEntity = "artist" | "track";

export interface SummarySearchParams {
    query: string;
    entity: SummarySearchEntity;
    start: Date;
    end: Date;
    sortBy: SortBy;
    token: string;
    demo: boolean;
    limit?: number;
    offset?: number;
}

export interface SummarySearchEntry {
    name: string;
    trackName?: string;
    artistName?: string;
    firstListen: string;
    totalMs: number;
    count: number;
    uri: string;
    rangeCount: number;
    rangeTotalMs: number;
    rangeRank: number;
    entity: SummarySearchEntity;
}

export interface SummarySearchResponse {
    results: SummarySearchEntry[];
}

export type SummaryFilters = {
    range: DateRange | undefined;
    sortBy: SortBy;
    query: string;
    offsetLimit: OffsetLimit;
};

import type { DateRange } from "react-day-picker";

export type SortBy = "time" | "count";
export type EntityType = "artists" | "tracks";
export type ChartInterval = "daily" | "monthly" | "yearly";

export interface ListeningTimeEntry {
    period: string;
    totalMs: number;
}

export interface ListeningTimeResponse {
    listeningTime: ListeningTimeEntry[];
}

export interface ListeningTimeParams {
    start: Date;
    end: Date;
    interval: ChartInterval;
    token: string;
    demo: boolean;
}

export interface OffsetLimit {
    offsetTracks: number;
    offsetArtists: number;
    limit: number;
}

export type ChartFilters = {
    range: DateRange | undefined;
    sortBy: SortBy;
    interval: ChartInterval;
};

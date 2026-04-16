import type { ChartInterval, SortBy } from "../Shared";

export interface BumpResponse {
    top_artists: BumpEntry[];
    top_tracks: BumpEntry[];
}

export interface BumpEntry {
    uri: string;
    name: string;
    timeline: BumpData[];
}

export interface BumpData {
    period: string;
    rank: number;
}

export interface BumpParams {
    start: Date;
    end: Date;
    sortBy: SortBy;
    interval: ChartInterval;
    token: string;
    demo: boolean;
}

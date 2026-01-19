import type { SortBy } from "./Summary";

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

export type ChartInterval = "monthly" | "yearly";

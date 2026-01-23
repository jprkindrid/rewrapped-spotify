import type { DateRange } from "react-day-picker";
import type { SortBy } from "./Shared";

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

export type ChartFilters = {
    range: DateRange | undefined;
    sortBy: SortBy;
    interval: ChartInterval;
};

export type ChartInterval = "daily" | "monthly" | "yearly";

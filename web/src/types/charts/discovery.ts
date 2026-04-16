import type { ChartInterval, SortBy } from "../Shared";

export interface DiscoveryEntry {
    name: string;
    firstListen: string;
    totalMs: number;
    count: number;
}

export interface DiscoveryResponse {
    artists: DiscoveryEntry[];
}

export interface DiscoveryParams {
    start: Date;
    end: Date;
    sortBy: SortBy;
    token: string;
    demo: boolean;
}

export interface DiscoverySearchEntry {
    name: string;
    firstListen: string;
    totalMs: number;
    count: number;
    uri: string;
}

export interface DiscoverySearchResponse {
    artists: DiscoverySearchEntry[];
}

export interface DiscoverySearchParams {
    query: string;
    token: string;
    demo: boolean;
}

export interface DiversityEntry {
    period: string;
    uniqueArtists: number;
    uniqueTracks: number;
}

export interface DiversityResponse {
    diversity: DiversityEntry[];
}

export interface DiversityParams {
    start: Date;
    end: Date;
    interval: ChartInterval;
    token: string;
    demo: boolean;
}

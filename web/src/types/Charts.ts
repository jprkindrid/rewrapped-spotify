import type { ChartInterval } from "./Bump";
import type { SortBy } from "./Shared";

// Listening Clock
export interface ListeningClockEntry {
    day: string;
    hour: number;
    totalMs: number;
}

export interface ListeningClockResponse {
    clock: ListeningClockEntry[];
}

export interface ListeningClockParams {
    start: Date;
    end: Date;
    token: string;
    demo: boolean;
}

// Discovery Timeline
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

// Artist Diversity
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

// Listening Streaks
export interface CalendarEntry {
    day: string;
    value: number;
}

export interface StreaksResponse {
    calendar: CalendarEntry[];
    longestStreak: number;
    currentStreak: number;
    totalActiveDays: number;
}

export interface StreaksParams {
    start: Date;
    end: Date;
    token: string;
    demo: boolean;
}

import type { ChartInterval } from "./Bump";

export type SortBy = "time" | "count";
export type EntityType = "artists" | "tracks";

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

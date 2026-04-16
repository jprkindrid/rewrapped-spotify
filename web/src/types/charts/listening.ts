import type { ChartInterval } from "../Shared";

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

export interface ListeningClockEntry {
    timestamp: string;
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

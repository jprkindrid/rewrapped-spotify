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

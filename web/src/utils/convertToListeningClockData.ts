import type { ListeningClockEntry } from "@/types/Charts";

export interface NivoHeatmapDataPoint {
    x: string;
    y: number;
}

export interface NivoHeatmapSeries {
    id: string;
    data: NivoHeatmapDataPoint[];
}

const HOUR_LABELS = [
    "12a", "1a", "2a", "3a", "4a", "5a",
    "6a", "7a", "8a", "9a", "10a", "11a",
    "12p", "1p", "2p", "3p", "4p", "5p",
    "6p", "7p", "8p", "9p", "10p", "11p",
];

const DAY_ORDER = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
];

const DAY_SHORT: Record<string, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
};

/**
 * Converts UTC clock entries to user's local timezone and rebuckets by local weekday/hour
 */
export function convertToListeningClockData(
    entries: ListeningClockEntry[],
    timezone: string,
    isMobile: boolean
): NivoHeatmapSeries[] {
    // Group by local weekday and hour
    const localGrid = new Map<string, number>();

    for (const entry of entries) {
        // Parse the UTC timestamp
        const utcDate = new Date(entry.timestamp);

        // Convert to user's local time using Intl
        try {
            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                weekday: "long",
                hour: "2-digit",
                hour12: false,
            });

            const parts = formatter.formatToParts(utcDate);
            const weekdayPart = parts.find((p) => p.type === "weekday");
            const hourPart = parts.find((p) => p.type === "hour");

            if (!weekdayPart || !hourPart) continue;

            const localWeekday = weekdayPart.value as string;
            const localHour = parseInt(hourPart.value, 10);

            const key = `${localWeekday}-${localHour}`;
            localGrid.set(key, (localGrid.get(key) ?? 0) + entry.totalMs);
        } catch {
            // If timezone conversion fails, fall back to UTC
            continue;
        }
    }

    // Convert grid to heatmap format (day x hour series)
    const dayMap = new Map<string, Map<number, number>>();

    for (const [key, totalMs] of localGrid.entries()) {
        const [day, hourStr] = key.split("-");
        const hour = parseInt(hourStr, 10);

        if (!dayMap.has(day)) {
            dayMap.set(day, new Map());
        }
        dayMap.get(day)!.set(hour, totalMs);
    }

    const heatmapData = DAY_ORDER.map((day) => {
        const hourMap = dayMap.get(day) ?? new Map<number, number>();
        const data = Array.from({ length: 24 }, (_, hour) => ({
            x: HOUR_LABELS[hour],
            y: hourMap.get(hour) ?? 0,
        }));

        return {
            id: isMobile ? DAY_SHORT[day] : day,
            data,
        };
    });

    return heatmapData;
}

import type { ChartInterval } from "@/types/Bump";
import type { ListeningTimeEntry } from "@/types/Shared";
import { msToHours } from "./formatTime";

export interface NivoLineDataPoint {
    x: string;
    y: number;
    totalMs: number;
}

export interface NivoLineSeries {
    id: string;
    data: NivoLineDataPoint[];
}

const MAX_DAILY_PERIODS = 120;
const MAX_DAILY_PERIODS_MOBILE = 60;
const MAX_MONTHLY_PERIODS = 24;

export function convertToListeningTimeData(
    entries: ListeningTimeEntry[],
    interval: ChartInterval,
    isMobile: boolean
): NivoLineSeries[] {
    if (!entries || entries.length === 0) return [];

    const sortedEntries = [...entries].sort((a, b) =>
        a.period.localeCompare(b.period, undefined, { numeric: true })
    );

    let limitedEntries = sortedEntries;
    if (interval === "daily" && sortedEntries.length > MAX_DAILY_PERIODS) {
        if (isMobile) {
            limitedEntries = sortedEntries.slice(-MAX_DAILY_PERIODS_MOBILE);
        } else {
            limitedEntries = sortedEntries.slice(-MAX_DAILY_PERIODS);
        }
    } else if (
        interval === "monthly" &&
        sortedEntries.length > MAX_MONTHLY_PERIODS
    ) {
        limitedEntries = sortedEntries.slice(-MAX_MONTHLY_PERIODS);
    }

    return [
        {
            id: "listening-time",
            data: limitedEntries.map((entry) => ({
                x: formatPeriodLabel(entry.period, interval),
                y: msToHours(entry.totalMs),
                totalMs: entry.totalMs,
            })),
        },
    ];
}

function formatPeriodLabel(period: string, interval: ChartInterval): string {
    const parts = period.split("-");

    switch (interval) {
        case "daily": {
            const [year, month, day] = parts;
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
            );
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
        case "monthly": {
            const [year, month] = parts;
            const monthIndex = parseInt(month) - 1;
            const monthName = new Date(0, monthIndex).toLocaleString("en-US", {
                month: "short",
            });
            return `${monthName} ${year}`;
        }
        default: {
            return period;
        }
    }
}

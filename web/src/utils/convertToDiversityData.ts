import type { DiversityEntry } from "@/types/charts/discovery";
import type { ChartInterval } from "@/types/Shared";

export interface NivoDiversityDataPoint {
    x: string;
    y: number;
}

export interface NivoDiversitySeries {
    id: string;
    data: NivoDiversityDataPoint[];
}

const MAX_DAILY_PERIODS = 120;
const MAX_DAILY_PERIODS_MOBILE = 60;
const MAX_MONTHLY_PERIODS = 24;

export function convertToDiversityData(
    entries: DiversityEntry[],
    interval: ChartInterval,
    isMobile: boolean
): NivoDiversitySeries[] {
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
            id: "Artists",
            data: limitedEntries.map((entry) => ({
                x: formatPeriodLabel(entry.period, interval),
                y: entry.uniqueArtists,
            })),
        },
        {
            id: "Tracks",
            data: limitedEntries.map((entry) => ({
                x: formatPeriodLabel(entry.period, interval),
                y: entry.uniqueTracks,
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

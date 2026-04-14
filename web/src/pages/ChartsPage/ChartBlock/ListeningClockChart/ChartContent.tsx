import type { ListeningClockEntry } from "@/types/Charts";
import { CHART_COLORS } from "@/utils/chartColors";
import { formatTime } from "@/utils/formatTime";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useMemo } from "react";

type ListeningClockChartContentProps = {
    clockData: ListeningClockEntry[];
    isDark: boolean;
    isMobile: boolean;
};

const HOUR_LABELS = [
    "12a", "1a", "2a", "3a", "4a", "5a",
    "6a", "7a", "8a", "9a", "10a", "11a",
    "12p", "1p", "2p", "3p", "4p", "5p",
    "6p", "7p", "8p", "9p", "10p", "11p",
];

// Reorder days so Monday is first
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

const ListeningClockChartContent = ({
    clockData,
    isDark,
    isMobile,
}: ListeningClockChartContentProps) => {
    const heatmapData = useMemo(() => {
        // Group by day, each day has 24 hour cells
        const dayMap = new Map<string, Map<number, number>>();

        for (const entry of clockData) {
            if (!dayMap.has(entry.day)) {
                dayMap.set(entry.day, new Map());
            }
            dayMap.get(entry.day)!.set(entry.hour, entry.totalMs);
        }

        return DAY_ORDER.map((day) => {
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
    }, [clockData, isMobile]);

    const maxValue = useMemo(() => {
        let max = 0;
        for (const entry of clockData) {
            if (entry.totalMs > max) max = entry.totalMs;
        }
        return max;
    }, [clockData]);

    return (
        <ResponsiveHeatMap
            data={heatmapData}
            margin={{
                top: 40,
                right: isMobile ? 10 : 30,
                bottom: 20,
                left: isMobile ? 40 : 100,
            }}
            axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: isMobile ? -45 : 0,
            }}
            axisLeft={{
                tickSize: 0,
                tickPadding: 8,
            }}
            colors={{
                type: "sequential",
                scheme: "greens",
                minValue: 0,
                maxValue: maxValue,
            }}
            emptyColor={isDark ? "#1a1a1a" : "#f5f5f5"}
            borderWidth={2}
            borderColor={isDark ? "#0a0a0a" : "#ffffff"}
            enableLabels={false}
            theme={{
                text: {
                    fill: isDark
                        ? CHART_COLORS.text.dark
                        : CHART_COLORS.text.light,
                    fontSize: isMobile ? 9 : 12,
                },
                axis: {
                    ticks: {
                        text: {
                            fill: isDark
                                ? CHART_COLORS.text.dark
                                : CHART_COLORS.text.light,
                            fontSize: isMobile ? 9 : 12,
                        },
                    },
                },
            }}
            tooltip={({ cell }) => (
                <div className="border-spotify-green/50 rounded border bg-white px-2 py-1 text-sm text-neutral-900 dark:bg-black dark:text-neutral-100">
                    <strong>
                        {cell.serieId} at {String(cell.data.x)}
                    </strong>
                    <div>{formatTime(cell.data.y as number)}</div>
                </div>
            )}
        />
    );
};

export default ListeningClockChartContent;

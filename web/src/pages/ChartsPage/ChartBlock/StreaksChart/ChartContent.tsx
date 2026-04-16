import type { CalendarEntry } from "@/types/charts/streaks";
import { CHART_COLORS } from "@/utils/chartColors";
import { formatTime } from "@/utils/formatTime";
import { ResponsiveCalendar } from "@nivo/calendar";
import { useMemo } from "react";

type StreaksChartContentProps = {
    calendar: CalendarEntry[];
    isDark: boolean;
    isMobile: boolean;
};

const StreaksChartContent = ({
    calendar,
    isDark,
    isMobile,
}: StreaksChartContentProps) => {
    const calendarData = useMemo(() => {
        return calendar.map((entry) => ({
            day: entry.day,
            value: entry.value,
        }));
    }, [calendar]);

    // Determine date range from the data — show just the most recent year
    const { from, to } = useMemo(() => {
        if (calendar.length === 0) {
            const now = new Date();
            return {
                from: `${now.getFullYear()}-01-01`,
                to: `${now.getFullYear()}-12-31`,
            };
        }

        const sorted = [...calendar].sort((a, b) => a.day.localeCompare(b.day));
        const lastDate = new Date(sorted[sorted.length - 1].day);
        const fromDate = new Date(lastDate);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        fromDate.setDate(fromDate.getDate() + 1);

        return {
            from: fromDate.toISOString().split("T")[0],
            to: sorted[sorted.length - 1].day,
        };
    }, [calendar]);

    return (
        <ResponsiveCalendar
            data={calendarData}
            from={from}
            to={to}
            emptyColor={isDark ? "#1a1a1a" : "#f0f0f0"}
            colors={["#144d2e", "#1a6b3c", "#1db954", "#57d580", "#a3e8b8"]}
            margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                bottom: 10,
                left: isMobile ? 10 : 30,
            }}
            yearSpacing={40}
            monthBorderColor={isDark ? "#171717" : "#ffffff"}
            dayBorderWidth={2}
            dayBorderColor={isDark ? "#0a0a0a" : "#ffffff"}
            theme={{
                text: {
                    fill: isDark
                        ? CHART_COLORS.text.dark
                        : CHART_COLORS.text.light,
                    fontSize: isMobile ? 9 : 11,
                },
                labels: {
                    text: {
                        fill: isDark
                            ? CHART_COLORS.text.dark
                            : CHART_COLORS.text.light,
                    },
                },
            }}
            tooltip={({ day, value }) => (
                <div className="border-spotify-green/50 rounded border bg-white px-2 py-1 text-sm text-neutral-900 dark:bg-black dark:text-neutral-100">
                    <strong>{day}</strong>
                    <div>{value ? formatTime(Number(value)) : "No data"}</div>
                </div>
            )}
        />
    );
};

export default StreaksChartContent;

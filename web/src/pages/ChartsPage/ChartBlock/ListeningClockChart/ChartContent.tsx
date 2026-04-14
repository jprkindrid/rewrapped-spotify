import type { NivoHeatmapSeries } from "@/utils/convertToListeningClockData";
import { CHART_COLORS } from "@/utils/chartColors";
import { formatTime } from "@/utils/formatTime";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useMemo } from "react";

type ListeningClockChartContentProps = {
    clockData: NivoHeatmapSeries[];
    isDark: boolean;
    isMobile: boolean;
};

const ListeningClockChartContent = ({
    clockData,
    isDark,
    isMobile,
}: ListeningClockChartContentProps) => {
    const maxValue = useMemo(() => {
        let max = 0;
        for (const series of clockData) {
            for (const point of series.data) {
                if ((point.y as number) > max) max = point.y as number;
            }
        }
        return max;
    }, [clockData]);

    return (
        <ResponsiveHeatMap
            data={clockData}
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
                    <div>
                        {formatTime(cell.data.y as number)}
                    </div>
                </div>
            )}
        />
    );
};

export default ListeningClockChartContent;


import type {
    NivoLineSeries,
    NivoLineDataPoint,
} from "@/utils/convertToListeningTimeData";
import type { ChartInterval } from "@/types/Bump";
import { formatTime } from "@/utils/formatTime";
import { CHART_COLORS } from "@/utils/chartColors";
import { ResponsiveLine } from "@nivo/line";
import { useMemo } from "react";

type ListeningTimeChartContentProps = {
    chartData: NivoLineSeries[];
    shouldRotate: boolean;
    isDark: boolean;
    isMobile: boolean;
    interval: ChartInterval;
};

const ListeningTimeChartContent = ({
    chartData,
    shouldRotate,
    isDark,
    isMobile,
    interval,
}: ListeningTimeChartContentProps) => {
    const tickValues = useMemo(() => {
        if (chartData.length === 0 || chartData[0].data.length === 0)
            return undefined;

        if (interval === "yearly") return undefined;

        const dataPoints = chartData[0].data;

        let maxTicks: number;
        if (interval === "daily") {
            maxTicks = isMobile ? 12 : 20;
        } else {
            // monthly
            maxTicks = isMobile ? 12 : 24;
        }

        if (dataPoints.length <= maxTicks) return undefined;

        const lastIndex = dataPoints.length - 1;
        const indices: number[] = [];
        for (let i = 0; i < maxTicks; i++) {
            const index = Math.round((i * lastIndex) / (maxTicks - 1));
            indices.push(index);
        }

        return indices.map((i) => dataPoints[i].x);
    }, [chartData, interval, isMobile]);

    const axisStyle = useMemo(
        () => ({
            domain: {
                line: {
                    stroke: isDark
                        ? CHART_COLORS.axis.dark
                        : CHART_COLORS.axis.light,
                    strokeWidth: 1,
                },
            },
            ticks: {
                line: {
                    stroke: isDark
                        ? CHART_COLORS.axis.dark
                        : CHART_COLORS.axis.light,
                    strokeWidth: 1,
                },
                text: {
                    fill: isDark
                        ? CHART_COLORS.text.dark
                        : CHART_COLORS.text.light,
                    fontSize: isMobile ? 10 : 12,
                },
            },
        }),
        [isMobile, isDark]
    );

    return (
        <ResponsiveLine
            data={chartData}
            margin={{
                top: 20,
                right: shouldRotate ? 60 : 30,
                bottom: 80,
                left: isMobile ? 50 : 60,
            }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            curve="monotoneX"
            colors={[CHART_COLORS.spotifyGreen]}
            lineWidth={3}
            enablePoints={true}
            pointSize={isMobile ? 6 : 10}
            pointColor={CHART_COLORS.spotifyGreen}
            pointBorderWidth={0}
            enableGridX={false}
            enableGridY={true}
            theme={{
                grid: {
                    line: {
                        stroke: isDark
                            ? CHART_COLORS.grid.dark
                            : CHART_COLORS.grid.light,
                    },
                },
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: shouldRotate ? 45 : 0,
                tickValues: tickValues,
                style: axisStyle,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                legend: "Hours",
                legendPosition: "middle",
                legendOffset: -45,
                style: axisStyle,
            }}
            useMesh={true}
            tooltip={({ point }) => (
                <div className="border-spotify-green/50 rounded border bg-white px-2 py-1 text-sm text-neutral-900 dark:bg-black dark:text-neutral-100">
                    <strong>{String(point.data.x)}</strong>
                    <div>
                        {formatTime(
                            (point.data as unknown as NivoLineDataPoint).totalMs
                        )}
                    </div>
                </div>
            )}
        />
    );
};

export default ListeningTimeChartContent;

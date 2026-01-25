import DisplayToggle from "@/components/DisplayToggle";
import type { UseBumpQueryResult } from "@/hooks/useBumpQuery";
import useBreakpoint from "@/hooks/useBreakpoint";
import type { BumpEntry, ChartFilters } from "@/types/Bump";
import type { EntityType } from "@/types/Shared";
import { convertToBumpData } from "@/utils/convertToBumpData";
import { CHART_COLORS } from "@/utils/chartColors";
import { lazy, Suspense, useMemo, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Loader2 } from "lucide-react";

const ResponsiveBump = lazy(() =>
    import("@nivo/bump").then((mod) => ({
        default: mod.ResponsiveBump,
    }))
);

type BumpChartProps = {
    bumpQuery: UseBumpQueryResult;
    filters: ChartFilters;
};

const BumpChart = ({ bumpQuery, filters }: BumpChartProps) => {
    const { data: bumpData, error: bumpError, status: bumpStatus } = bumpQuery;
    const topTracks: BumpEntry[] | undefined = bumpData?.top_tracks;
    const topArtists: BumpEntry[] | undefined = bumpData?.top_artists;

    const [displayType, setDisplayType] = useState<EntityType>("artists");
    const isMobile = useBreakpoint("md");

    const displayData = displayType === "artists" ? topArtists : topTracks;
    const shouldRotate = filters.interval === "monthly";

    const isDark = useDarkMode();
    const isDailyInterval = filters.interval === "daily";
    const noData = !displayData || displayData.length === 0;

    const axisBottomStyle = useMemo(
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

    const loading = (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <h2 className="-mt-12 text-2xl font-semibold">Loading Chart...</h2>
            <div>
                <Loader2 className="size-12 animate-spin" />
            </div>
        </div>
    );

    // All this is to prevent the song name overflowing but still having the tooltip contain it lol
    const truncateLabel = (label: string, maxLength = 20) => {
        return label.length > maxLength
            ? label.substring(0, maxLength) + "..."
            : label;
    };

    const fullNameMap = useMemo(() => {
        if (
            bumpStatus !== "success" ||
            !displayData ||
            displayData.length === 0
        )
            return {};
        return displayData.reduce(
            (acc, entry) => {
                const truncated =
                    displayType === "tracks"
                        ? truncateLabel(entry.name)
                        : entry.name;
                acc[truncated] = entry.name;
                return acc;
            },
            {} as Record<string, string>
        );
    }, [displayData, displayType, bumpStatus]);

    return (
        <div className="relative pb-2">
            <DisplayToggle
                displayType={displayType}
                onDisplayTypeChange={setDisplayType}
                noData={noData}
            />
            <div className="animate-in fade-in zoom-in-95 h-150 w-full overflow-visible rounded-b-lg duration-1000">
                <h2 className="-mb-6 pt-4 text-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    Artist & Track Rankings
                </h2>
                {bumpStatus === "success" &&
                    displayData &&
                    displayData.length > 0 && (
                        <Suspense fallback={loading}>
                            <p className="mt-1 -mb-6 block w-full text-center font-bold text-neutral-800 md:hidden dark:text-neutral-200">
                                Hover a line to see track/artist name
                            </p>
                            <ResponsiveBump
                                data={convertToBumpData(displayData)}
                                xPadding={0.2}
                                colors={{ scheme: "category10" }}
                                theme={{
                                    grid: {
                                        line: {
                                            stroke: isDark
                                                ? CHART_COLORS.grid.dark
                                                : CHART_COLORS.grid.light,
                                        },
                                    },
                                }}
                                lineWidth={3}
                                activeLineWidth={6}
                                inactiveLineWidth={3}
                                inactiveOpacity={0.15}
                                pointSize={isMobile ? 6 : 10}
                                activePointSize={isMobile ? 10 : 16}
                                inactivePointSize={0}
                                pointColor={{ theme: "background" }}
                                pointBorderWidth={3}
                                activePointBorderWidth={3}
                                pointBorderColor={{ from: "serie.color" }}
                                axisTop={null}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: shouldRotate ? 45 : 0,
                                    style: axisBottomStyle,
                                }}
                                axisRight={null}
                                endLabel={!isMobile}
                                startLabel={false}
                                margin={{
                                    top: 40,
                                    right: isMobile
                                        ? 20
                                        : displayType == "artists"
                                          ? 120
                                          : 150,
                                    bottom: 80,
                                    left: isMobile ? 30 : 50,
                                }}
                                lineTooltip={({ serie }) => (
                                    <div className="border-spotify-green/50 rounded border bg-white px-2 py-1 text-sm text-neutral-900 dark:bg-black dark:text-neutral-100">
                                        <strong>{fullNameMap[serie.id]}</strong>
                                    </div>
                                )}
                            />
                        </Suspense>
                    )}

                {bumpStatus === "success" && noData && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                            No ranking data available
                        </h2>
                        <p className="text-neutral-500">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                )}

                {bumpStatus === "pending" && !isDailyInterval && loading}
                {bumpStatus === "error" && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border-4 border-red-500 bg-red-100 text-center">
                        <h2 className="text-4xl font-bold text-red-950">
                            Error:
                        </h2>
                        <p className="text-lg text-red-800/70">
                            {bumpError.message || "An unknown error occured"}
                        </p>
                    </div>
                )}
            </div>

            {isDailyInterval && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-md dark:bg-black/70">
                    <div className="px-6 text-center">
                        <p className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                            Daily interval not available
                        </p>
                        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                            Select Monthly or Yearly to view ranking charts
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BumpChart;

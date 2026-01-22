import DisplayToggle from "@/components/DisplayToggle";
import type { UseBumpQueryResult } from "@/hooks/useBumpQuery";
import useBreakpoint from "@/hooks/useBreakpoint";
import type { BumpEntry, ChartFilters } from "@/types/Bump";
import type { EntityType } from "@/types/Shared";
import { convertToBumpData } from "@/utils/convertToBumpData";
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

    const axisBottomStyle = useMemo(
        () => ({
            domain: {
                line: {
                    stroke: isDark ? "#aaaaaa" : "#555555",
                    strokeWidth: 1,
                },
            },
            ticks: {
                line: {
                    stroke: isDark ? "#aaaaaa" : "#555555",
                    strokeWidth: 1,
                },
                text: {
                    fill: isDark ? "#f5f5f5" : "#171717",
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

    return (
        <div>
            <DisplayToggle
                displayType={displayType}
                onDisplayTypeChange={setDisplayType}
            />
            <div className="animate-in fade-in zoom-in-95 h-150 w-full overflow-hidden rounded-b-lg duration-1000 [&_svg]:drop-shadow-sm">
                {bumpStatus === "success" && (
                    <Suspense fallback={loading}>
                        <p className="mt-1 -mb-6 block w-full text-center font-bold text-neutral-800 md:hidden dark:text-neutral-200">
                            Hover a line to see track/artist name
                        </p>
                        <ResponsiveBump
                            data={convertToBumpData(displayData!)}
                            xPadding={0.2}
                            colors={{ scheme: "category10" }}
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
                                right: isMobile ? 20 : 120,
                                bottom: 80,
                                left: isMobile ? 30 : 50,
                            }}
                            lineTooltip={({ serie }) => (
                                <div className="border-spotify-green/50 rounded border bg-white px-2 py-1 text-sm text-neutral-900 dark:bg-black dark:text-neutral-100">
                                    <strong>{serie.id}</strong>
                                </div>
                            )}
                        />
                    </Suspense>
                )}

                {bumpStatus === "pending" && loading}
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
        </div>
    );
};

export default BumpChart;

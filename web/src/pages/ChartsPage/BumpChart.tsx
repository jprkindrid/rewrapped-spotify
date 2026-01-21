import DisplayToggle from "@/components/DisplayToggle";
import type { UseBumpQueryResult } from "@/hooks/useBumpQuery";
import useBreakpoint from "@/hooks/useBreakpoint";
import type { BumpEntry, ChartFilters } from "@/types/Bump";
import type { EntityType } from "@/types/Shared";
import { convertToBumpData } from "@/utils/convertToBumpData";
import { lazy, Suspense, useState } from "react";

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
    const { data, status } = bumpQuery;
    const topTracks: BumpEntry[] | undefined = data?.top_tracks;
    const topArtists: BumpEntry[] | undefined = data?.top_artists;

    const [displayType, setDisplayType] = useState<EntityType>("artists");
    const isMobile = useBreakpoint("md");

    const displayData = displayType === "artists" ? topArtists : topTracks;
    const shouldRotate = filters.interval === "monthly";

    return (
        <div>
            <DisplayToggle
                displayType={displayType}
                onDisplayTypeChange={setDisplayType}
            />
            <div className="h-150 w-full overflow-hidden">
                {status === "success" && (
                    <Suspense
                        fallback={
                            <div className="flex h-full items-center justify-center">
                                <div>Loading chart...</div>
                            </div>
                        }
                    >
                        <p className="mt-1 -mb-6 block w-full text-center font-bold text-neutral-800 md:hidden dark:text-neutral-200">
                            Hover a line to see track/artist name
                        </p>
                        <ResponsiveBump
                            data={convertToBumpData(displayData!)}
                            xPadding={0.2}
                            colors={{ scheme: "spectral" }}
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
                            }}
                            axisRight={null}
                            endLabel={!isMobile}
                            startLabel={false}
                            theme={{
                                axis: {
                                    ticks: {
                                        text: {
                                            fill: "#cccccc",
                                            fontSize: isMobile ? 10 : 12,
                                        },
                                    },
                                },
                                grid: {
                                    line: {
                                        stroke: "#333333",
                                    },
                                },
                            }}
                            margin={{
                                top: 40,
                                right: isMobile ? 20 : 120,
                                bottom: 80,
                                left: isMobile ? 30 : 50,
                            }}
                            lineTooltip={({ serie }) => (
                                <div className="border-spotify-green/50 rounded border bg-black px-2 py-1 text-sm text-neutral-100 dark:bg-white dark:text-neutral-900">
                                    <strong>{serie.id}</strong>
                                </div>
                            )}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
};

export default BumpChart;

import DisplayToggle from "@/components/DisplayToggle";
import type { UseBumpQueryResult } from "@/hooks/useBumpQuery";
import type { BumpEntry, ChartFilters } from "@/types/Bump";
import type { EntityType } from "@/types/Shared";
import { convertToBumpData } from "@/utils/convertToBumpData";
import { lazy, Suspense } from "react";
import { useState } from "react";

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

    const displayData = displayType == "artists" ? topArtists : topTracks;
    const shouldRotate = filters.interval == "monthly";

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
                        <ResponsiveBump
                            data={convertToBumpData(displayData!)}
                            xPadding={0.2}
                            colors={{ scheme: "spectral" }}
                            lineWidth={3}
                            activeLineWidth={6}
                            inactiveLineWidth={3}
                            inactiveOpacity={0.15}
                            pointSize={10}
                            activePointSize={16}
                            inactivePointSize={0}
                            pointColor={{ theme: "background" }}
                            pointBorderWidth={3}
                            activePointBorderWidth={3}
                            pointBorderColor={{ from: "serie.color" }}
                            axisLeft={null}
                            axisTop={null}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: shouldRotate ? 45 : 0,
                            }}
                            theme={{
                                axis: {
                                    ticks: {
                                        text: {
                                            fill: "#cccccc",
                                            fontSize: 12,
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
                                right: 100,
                                bottom: 80,
                                left: 60,
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

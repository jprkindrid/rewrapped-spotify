import type { UseDiscoveryQueryResult } from "@/hooks/useDiscoveryQuery";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import ArtistSearchPopover from "./ArtistSearchPopover";

const ChartContent = lazy(() => import("./ChartContent"));

type DiscoveryChartProps = {
    discoveryQuery: UseDiscoveryQueryResult;
    range: DateRange | undefined;
    token: string;
    demo: boolean;
};

const DiscoveryChart = ({
    discoveryQuery,
    range,
    token,
    demo,
}: DiscoveryChartProps) => {
    const {
        data: discoveryData,
        error: discoveryError,
        status: discoveryStatus,
    } = discoveryQuery;

    const isDark = useDarkMode();
    const isMobile = useBreakpoint("md");

    const hasData = useMemo(() => {
        return (discoveryData?.artists?.length ?? 0) > 0;
    }, [discoveryData]);

    const loading = (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <h2 className="-mt-12 text-2xl font-semibold">Loading Chart...</h2>
            <div>
                <Loader2 className="size-12 animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="mt-6 mx-4">
            <div className="flex items-center justify-between px-2">
                <div className="w-20" />
                <h2 className="flex-1 text-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    Discovery Timeline
                </h2>
                <div className="flex w-20 justify-end">
                    <ArtistSearchPopover
                        range={range}
                        token={token}
                        demo={demo}
                    />
                </div>
            </div>
            <p className="mb-4 mt-1 text-center text-sm text-neutral-500">
                When did you discover your top artists?
            </p>
            <div className="animate-in fade-in zoom-in-95 w-full overflow-visible rounded-b-lg duration-1000"
                 style={{ minHeight: isMobile ? "400px" : "500px" }}>
                {discoveryStatus === "success" && hasData && (
                    <Suspense fallback={loading}>
                        <ChartContent
                            artists={discoveryData!.artists}
                            isDark={isDark}
                            isMobile={isMobile}
                        />
                    </Suspense>
                )}

                {discoveryStatus === "success" && !hasData && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                            No discovery data available
                        </h2>
                        <p className="text-neutral-500">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                )}

                {discoveryStatus === "pending" && loading}

                {discoveryStatus === "error" && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border-4 border-red-500 bg-red-100 text-center">
                        <h2 className="text-4xl font-bold text-red-950">
                            Error:
                        </h2>
                        <p className="text-lg text-red-800/70">
                            {discoveryError?.message ||
                                "An unknown error occurred"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoveryChart;

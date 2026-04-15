import type { UseDiscoveryQueryResult } from "@/hooks/useDiscoveryQuery";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import ArtistSearchPopover from "./ArtistSearchPopover";

const ChartContent = lazy(() => import("./ChartContent"));

type DiscoveryChartProps = {
    discoveryQuery: UseDiscoveryQueryResult;
    token: string;
    demo: boolean;
};

const DiscoveryChart = ({
    discoveryQuery,
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
        <div className="mt-6">
            <div className="relative">
                <h2 className="text-center text-xl font-bold">
                    Discovery Timeline
                </h2>
                <div className="absolute top-1/2 right-2 -translate-y-1/2 pr-4">
                    <ArtistSearchPopover
                        token={token}
                        demo={demo}
                    />
                </div>
            </div>
            <p className="mb-4 mt-1 text-center text-sm text-muted-foreground">
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
                        <h2 className="text-2xl font-bold text-muted-foreground">
                            No discovery data available
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                )}

                {discoveryStatus === "pending" && loading}

                {discoveryStatus === "error" && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border border-destructive/30 bg-destructive/5 text-center dark:bg-destructive/10">
                        <h2 className="text-2xl font-bold text-destructive">
                            Error
                        </h2>
                        <p className="text-sm text-muted-foreground">
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

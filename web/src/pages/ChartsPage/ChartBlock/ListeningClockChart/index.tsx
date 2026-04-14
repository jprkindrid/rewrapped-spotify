import type { UseListeningClockQueryResult } from "@/hooks/useListeningClockQuery";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import type { ListeningClockEntry } from "@/types/Charts";

const ChartContent = lazy(() => import("./ChartContent"));

type ListeningClockChartProps = {
    listeningClockQuery: UseListeningClockQueryResult;
};

const ListeningClockChart = ({
    listeningClockQuery,
}: ListeningClockChartProps) => {
    const {
        data: clockData,
        error: clockError,
        status: clockStatus,
    } = listeningClockQuery;

    const isDark = useDarkMode();
    const isMobile = useBreakpoint("md");

    const hasData = useMemo(() => {
        if (!clockData?.clock) return false;
        return clockData.clock.some(
            (entry: ListeningClockEntry) => entry.totalMs > 0
        );
    }, [clockData]);

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
            <h2 className="mb-4 text-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Listening Clock
            </h2>
            <p className="mb-4 text-center text-sm text-neutral-500">
                When do you listen to music the most?
            </p>
            <div className="animate-in fade-in zoom-in-95 w-full overflow-visible rounded-b-lg duration-1000"
                 style={{ height: isMobile ? "320px" : "400px" }}>
                {clockStatus === "success" && hasData && (
                    <Suspense fallback={loading}>
                        <ChartContent
                            clockData={clockData!.clock}
                            isDark={isDark}
                            isMobile={isMobile}
                        />
                    </Suspense>
                )}

                {clockStatus === "success" && !hasData && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                            No listening data available
                        </h2>
                        <p className="text-neutral-500">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                )}

                {clockStatus === "pending" && loading}

                {clockStatus === "error" && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border-4 border-red-500 bg-red-100 text-center">
                        <h2 className="text-4xl font-bold text-red-950">
                            Error:
                        </h2>
                        <p className="text-lg text-red-800/70">
                            {clockError?.message || "An unknown error occurred"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListeningClockChart;

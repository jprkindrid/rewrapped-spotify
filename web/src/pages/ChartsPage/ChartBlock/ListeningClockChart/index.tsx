import type { UseListeningClockQueryResult } from "@/hooks/useListeningClockQuery";
import { useUserTimezone } from "@/hooks/useUserTimezone";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { convertToListeningClockData } from "@/utils/convertToListeningClockData";

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

    const userTimezone = useUserTimezone();
    const isDark = useDarkMode();
    const isMobile = useBreakpoint("md");

    const chartData = useMemo(() => {
        if (!clockData?.clock) return [];
        return convertToListeningClockData(clockData.clock, userTimezone, isMobile);
    }, [clockData, userTimezone, isMobile]);

    const hasData = useMemo(() => {
        return chartData.some(
            (series) =>
                series.data.some((point) => (point.y as number) > 0)
        );
    }, [chartData]);

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
            <div className="flex items-center justify-between">
                <h2 className="text-center text-xl font-bold text-neutral-800 dark:text-neutral-200 flex-1">
                    Listening Clock
                </h2>
            </div>
            <p className="mb-2 text-center text-xs text-neutral-400">
                Times shown in your local timezone
            </p>
            <p className="mb-4 text-center text-sm text-neutral-500">
                When do you listen to music the most?
            </p>
            <div className="animate-in fade-in zoom-in-95 w-full overflow-visible rounded-b-lg duration-1000"
                 style={{ height: isMobile ? "320px" : "400px" }}>
                {clockStatus === "success" && hasData && (
                    <Suspense fallback={loading}>
                        <ChartContent
                            clockData={chartData}
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


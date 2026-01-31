import type { UseListeningTimeQueryResult } from "@/hooks/useListeningTimeQuery";
import type { ChartFilters } from "@/types/Bump";
import { convertToListeningTimeData } from "@/utils/convertToListeningTimeData";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";

const ChartContent = lazy(() => import("./ChartContent"));

type ListeningTimeChartProps = {
    listeningTimeQuery: UseListeningTimeQueryResult;
    filters: ChartFilters;
};

const ListeningTimeChart = ({
    listeningTimeQuery,
    filters,
}: ListeningTimeChartProps) => {
    const {
        data: listeningTimeData,
        error: listeningTimeError,
        status: listeningTimeStatus,
    } = listeningTimeQuery;

    const isDark = useDarkMode();
    const isMobile = useBreakpoint("md");
    const shouldRotate = filters.interval !== "yearly";

    const chartData = useMemo(() => {
        if (!listeningTimeData?.listeningTime) return [];
        return convertToListeningTimeData(
            listeningTimeData.listeningTime,
            filters.interval,
            isMobile
        );
    }, [listeningTimeData, filters.interval, isMobile]);

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
                Listening Time Over Time
            </h2>
            <div className="animate-in fade-in zoom-in-95 h-80 w-full overflow-visible rounded-b-lg duration-1000">
                {listeningTimeStatus === "success" && chartData.length > 0 && (
                    <Suspense fallback={loading}>
                        <ChartContent
                            key={filters.interval}
                            chartData={chartData}
                            shouldRotate={shouldRotate}
                            isDark={isDark}
                            isMobile={isMobile}
                            interval={filters.interval}
                        />
                    </Suspense>
                )}

                {listeningTimeStatus === "success" &&
                    chartData.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                            <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                                No listening data available
                            </h2>
                            <p className="text-neutral-500">
                                Try adjusting your date range or filters.
                            </p>
                        </div>
                    )}

                {listeningTimeStatus === "pending" && loading}

                {listeningTimeStatus === "error" && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border-4 border-red-500 bg-red-100 text-center">
                        <h2 className="text-4xl font-bold text-red-950">
                            Error:
                        </h2>
                        <p className="text-lg text-red-800/70">
                            {listeningTimeError.message ||
                                "An unknown error occurred"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListeningTimeChart;

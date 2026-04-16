import type { UseDiversityQueryResult } from "@/hooks/useDiversityQuery";
import type { ChartFilters } from "@/types/Shared";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { convertToDiversityData } from "@/utils/convertToDiversityData";

const ChartContent = lazy(() => import("./ChartContent"));

type DiversityChartProps = {
    diversityQuery: UseDiversityQueryResult;
    filters: ChartFilters;
};

const DiversityChart = ({ diversityQuery, filters }: DiversityChartProps) => {
    const {
        data: diversityData,
        error: diversityError,
        status: diversityStatus,
    } = diversityQuery;

    const isDark = useDarkMode();
    const isMobile = useBreakpoint("md");
    const shouldRotate = filters.interval !== "yearly";

    const chartData = useMemo(() => {
        if (!diversityData?.diversity) return [];
        return convertToDiversityData(
            diversityData.diversity,
            filters.interval,
            isMobile
        );
    }, [diversityData, filters.interval, isMobile]);

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
            <h2 className="mb-4 text-center text-xl font-bold">
                Artist Diversity Over Time
            </h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
                How many unique artists and tracks do you listen to each period?
            </p>
            <div className="animate-in fade-in zoom-in-95 h-80 w-full overflow-visible rounded-b-lg duration-1000">
                {diversityStatus === "success" && chartData.length > 0 && (
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

                {diversityStatus === "success" && chartData.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <h2 className="text-muted-foreground text-2xl font-bold">
                            No diversity data available
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                )}

                {diversityStatus === "pending" && loading}

                {diversityStatus === "error" && (
                    <div className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10 flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border text-center">
                        <h2 className="text-destructive text-2xl font-bold">
                            Error
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {diversityError?.message ||
                                "An unknown error occurred"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiversityChart;

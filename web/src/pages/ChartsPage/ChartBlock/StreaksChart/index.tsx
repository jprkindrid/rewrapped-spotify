import type { UseStreaksQueryResult } from "@/hooks/useStreaksQuery";
import { useDarkMode } from "@/hooks/useDarkMode";
import useBreakpoint from "@/hooks/useBreakpoint";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { formatTime } from "@/utils/formatTime";
import { Flame, Calendar, Activity } from "lucide-react";

const ChartContent = lazy(() => import("./ChartContent"));

type StreaksChartProps = {
    streaksQuery: UseStreaksQueryResult;
};

const StreaksChart = ({ streaksQuery }: StreaksChartProps) => {
    const {
        data: streaksData,
        error: streaksError,
        status: streaksStatus,
    } = streaksQuery;

    const isDark = useDarkMode();
    const isMobile = useBreakpoint("md");

    const hasData = useMemo(() => {
        return (streaksData?.calendar?.length ?? 0) > 0;
    }, [streaksData]);

    // Compute total listening time for the stats banner
    const totalListeningMs = useMemo(() => {
        if (!streaksData?.calendar) return 0;
        return streaksData.calendar.reduce((sum, entry) => sum + entry.value, 0);
    }, [streaksData]);

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
                Listening Streaks
            </h2>
            <p className="mb-4 text-center text-sm text-muted-foreground">
                Your daily listening activity at a glance
            </p>

            {/* Stats Banner */}
            {streaksStatus === "success" && hasData && streaksData && (
                <div
                    className={`mx-auto mb-6 grid max-w-lg gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}
                >
                    <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-3">
                        <Flame className="text-spotify-green mb-1 size-5" />
                        <span className="text-lg font-bold">
                            {streaksData.longestStreak}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Longest Streak
                        </span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-3">
                        <Activity className="text-spotify-green mb-1 size-5" />
                        <span className="text-lg font-bold">
                            {streaksData.currentStreak}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Current Streak
                        </span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-3">
                        <Calendar className="text-spotify-green mb-1 size-5" />
                        <span className="text-lg font-bold">
                            {streaksData.totalActiveDays}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Active Days
                        </span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-3">
                        <Flame className="text-spotify-green mb-1 size-5" />
                        <span className="text-lg font-bold">
                            {formatTime(totalListeningMs)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Total Time
                        </span>
                    </div>
                </div>
            )}

            <div
                className="animate-in fade-in zoom-in-95 w-full overflow-visible rounded-b-lg duration-1000"
                style={{ height: isMobile ? "200px" : "240px" }}
            >
                {streaksStatus === "success" && hasData && streaksData && (
                    <Suspense fallback={loading}>
                        <ChartContent
                            calendar={streaksData.calendar}
                            isDark={isDark}
                            isMobile={isMobile}
                        />
                    </Suspense>
                )}

                {streaksStatus === "success" && !hasData && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                        <h2 className="text-2xl font-bold text-muted-foreground">
                            No streak data available
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                )}

                {streaksStatus === "pending" && loading}

                {streaksStatus === "error" && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-b-lg border border-destructive/30 bg-destructive/5 text-center dark:bg-destructive/10">
                        <h2 className="text-2xl font-bold text-destructive">
                            Error
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {streaksError?.message ||
                                "An unknown error occurred"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreaksChart;

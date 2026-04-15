import type { SummaryFilters } from "@/types/Summary";
import { Button } from "@/components/ui/button";

import DateRangePicker from "./DateRangePicker";
import YearRangeDropown from "./YearRangeDropdown";
import type { ChartFilters } from "@/types/Bump";
import type { Dispatch, SetStateAction } from "react";
import type { SortBy } from "@/types/Shared";

type FilterControlParams<T extends SummaryFilters | ChartFilters> = {
    bufferFilters: T;
    setBufferFilters: Dispatch<SetStateAction<T>>;
    onApply: () => void;
    onReset: () => void;
};

const FilterControls = <T extends SummaryFilters | ChartFilters>({
    bufferFilters,
    setBufferFilters,
    onApply,
    onReset,
}: FilterControlParams<T>) => {
    const { sortBy } = bufferFilters;
    const isChart = "interval" in bufferFilters;
    const interval = isChart ? bufferFilters.interval : null;

    const updateSortBy = (newSort: SortBy) => {
        setBufferFilters((prev) => ({
            ...prev,
            sortBy: newSort,
        }));
    };

    const updateInterval = (newInterval: "daily" | "monthly" | "yearly") => {
        setBufferFilters((prev) => ({
            ...prev,
            interval: newInterval,
        }));
    };

    return (
        <div className="flex w-full flex-col items-center gap-4 px-4 py-5 sm:px-6">
            {/* Sort */}
            <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Sort By
                </span>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={sortBy === "count" ? "default" : "outline"}
                        onClick={() => updateSortBy("count")}
                        className={
                            sortBy === "count"
                                ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                                : ""
                        }
                    >
                        Count
                    </Button>
                    <Button
                        size="sm"
                        variant={sortBy === "time" ? "default" : "outline"}
                        onClick={() => updateSortBy("time")}
                        className={
                            sortBy === "time"
                                ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                                : ""
                        }
                    >
                        Time
                    </Button>
                </div>
            </div>

            {/* Interval (charts only) */}
            {isChart && (
                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Interval
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={
                                interval === "yearly"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => updateInterval("yearly")}
                            className={
                                interval === "yearly"
                                    ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                                    : ""
                            }
                        >
                            Yearly
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                interval === "monthly"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => updateInterval("monthly")}
                            className={
                                interval === "monthly"
                                    ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                                    : ""
                            }
                        >
                            Monthly
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                interval === "daily"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => updateInterval("daily")}
                            className={
                                interval === "daily"
                                    ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                                    : ""
                            }
                        >
                            Daily
                        </Button>
                    </div>
                </div>
            )}

            {/* Date Range */}
            <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Date Range
                </span>
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                    <YearRangeDropown setBufferFilters={setBufferFilters} />
                    <DateRangePicker
                        bufferFilters={bufferFilters}
                        setBufferFilters={setBufferFilters}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={onApply}
                    className="bg-spotify-green hover:bg-spotify-green/90 text-black"
                >
                    Apply
                </Button>
                <Button size="sm" variant="outline" onClick={onReset}>
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default FilterControls;

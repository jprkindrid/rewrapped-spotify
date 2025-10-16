import type { SummaryFilters } from "@/shared-components/SummaryTypes";
import type { Setter } from "@/utils/types";
import clsx from "clsx";

import DateRangePicker from "./DateRangePicker";
import YearRangeDropown from "./YearRangeDropdown";

type FilterControlParams = {
    bufferFilters: SummaryFilters;
    setBufferFilters: Setter<SummaryFilters>;
    onApply: () => void;
    onReset: () => void;
};

const FilterControls = ({
    bufferFilters,
    setBufferFilters,
    onApply,
    onReset,
}: FilterControlParams) => {
    const { sortBy } = bufferFilters;

    return (
        <div className="flex w-full justify-center py-2">
            <div className="flex w-full flex-col items-center">
                <div className="text-spotify-green text-2xl font-bold text-shadow-sm sm:mb-4">
                    Filter Controls
                </div>

                <div className="flex w-full max-w-4xl flex-col items-center justify-center">
                    <div className="sm:justify-beginning mb-4 flex flex-col items-center gap-2 sm:mb-0 sm:flex-row">
                        <div className="mb-2 text-xl sm:mb-0">
                            Select Sort Type
                        </div>
                        <div className="flex gap-2">
                            <button
                                className={clsx(
                                    "w-22 rounded-md border bg-stone-200 px-4 py-2 font-bold transition hover:brightness-105 dark:bg-stone-700/50",
                                    sortBy === "count"
                                        ? "border-inset border-spotify-green text-spotify-green"
                                        : "text-black dark:text-white/70"
                                )}
                                onClick={() =>
                                    setBufferFilters((prev) => ({
                                        ...prev,
                                        sortBy: "count",
                                    }))
                                }
                            >
                                Count
                            </button>
                            <button
                                className={clsx(
                                    "w-22 rounded-md border bg-stone-200 px-4 py-2 font-bold transition hover:brightness-105 dark:bg-stone-700/50",
                                    sortBy === "time"
                                        ? "border-inset border-spotify-green text-spotify-green"
                                        : "border text-black dark:text-white/70"
                                )}
                                onClick={() =>
                                    setBufferFilters((prev) => ({
                                        ...prev,
                                        sortBy: "time",
                                    }))
                                }
                            >
                                Time
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center sm:flex-row sm:items-end">
                        <div className="mb-2 text-xl sm:mb-1">
                            Select Date Range
                        </div>
                        <div className="mt-4 flex flex-col items-center justify-center sm:flex-row">
                            <div className="mb-3 sm:mb-0">
                                <YearRangeDropown
                                    setBufferFilters={setBufferFilters}
                                />
                            </div>
                            <DateRangePicker
                                bufferFilters={bufferFilters}
                                setBufferFilters={setBufferFilters}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-spotify-green my-6 h-[1px] w-4/5 max-w-2xl"></div>
                <div className="flex gap-2">
                    <button
                        className="bg-spotify-green w-22 rounded-md px-4 py-2 font-bold text-black transition hover:brightness-110"
                        onClick={onApply}
                    >
                        Apply
                    </button>
                    <button
                        className="w-22 rounded-md bg-stone-800/50 px-4 py-2 font-bold text-white/70 transition hover:bg-stone-700/50"
                        onClick={onReset}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterControls;

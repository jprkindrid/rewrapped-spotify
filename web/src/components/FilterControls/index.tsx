import type { SummaryFilters } from "@/types/Summary";
import type { Setter } from "@/utils/types";
import { Button } from "@/components/ui/button";

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
                <div className="text-2xl font-bold text-shadow-sm sm:mb-4">
                    Filter Controls
                </div>

                <div className="flex w-full max-w-4xl flex-col items-center justify-center">
                    <div className="sm:justify-beginning mb-4 flex flex-col items-center gap-2 sm:mb-0 sm:flex-row">
                        <div className="mb-2 text-xl sm:mb-0">
                            Select Sort Type
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    sortBy === "count" ? "default" : "outline"
                                }
                                onClick={() =>
                                    setBufferFilters((prev) => ({
                                        ...prev,
                                        sortBy: "count",
                                    }))
                                }
                            >
                                Count
                            </Button>
                            <Button
                                variant={
                                    sortBy === "time" ? "default" : "outline"
                                }
                                onClick={() =>
                                    setBufferFilters((prev) => ({
                                        ...prev,
                                        sortBy: "time",
                                    }))
                                }
                            >
                                Time
                            </Button>
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

                <div className="bg-spotify-green my-6 h-px w-4/5 max-w-2xl"></div>
                <div className="flex gap-2">
                    <button
                        className="bg-spotify-green w-22 rounded-md px-4 py-2 font-bold text-black transition hover:brightness-110 dark:text-white"
                        onClick={onApply}
                    >
                        Apply
                    </button>
                    <button
                        className="w-22 rounded-md bg-neutral-800/50 px-4 py-2 font-bold text-white/70 transition hover:bg-neutral-700/50"
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

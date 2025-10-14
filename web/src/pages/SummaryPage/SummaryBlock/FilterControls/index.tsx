import type { SummaryFilters } from "@/shared-components/SummaryTypes";
import type { Setter } from "@/utils/types";

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
    return (
        <div className="flex flex-col items-center text-start">
            <div className="text-spotify-green text-2xl font-bold text-shadow-sm">
                Filter Controls
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button
                    className="rounded-md bg-stone-800/50 px-4 py-2 font-bold text-white/70 transition hover:bg-stone-700/50"
                    onClick={onReset}
                >
                    Reset
                </button>
                <button
                    className="bg-spotify-green rounded-md px-4 py-2 font-bold text-black transition hover:brightness-110"
                    onClick={onApply}
                >
                    Apply
                </button>
            </div>
            <div className="my-2 flex flex-col justify-center text-start">
                <div className="underline">Date Range</div>
                <DateRangePicker
                    bufferFilters={bufferFilters}
                    setBufferFilters={setBufferFilters}
                />
            </div>
            <div className="flex items-center">
                <YearRangeDropown setBufferFilters={setBufferFilters} />
            </div>
        </div>
    );
};

export default FilterControls;

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
        <div className="flex w-full justify-center">
            <div className="flex flex-col items-center">
                <div className="text-spotify-green text-2xl font-bold text-shadow-sm">
                    Filter Controls
                </div>
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        className="w-22 rounded-md bg-stone-800/50 px-4 py-2 font-bold text-white/70 transition hover:bg-stone-700/50"
                        onClick={onReset}
                    >
                        Reset
                    </button>
                    <button
                        className="bg-spotify-green w-22 rounded-md px-4 py-2 font-bold text-black transition hover:brightness-110"
                        onClick={onApply}
                    >
                        Apply
                    </button>
                </div>
                <div className="my-2 flex w-full flex-col justify-center text-start">
                    <div className="underline">Date Range</div>
                    <DateRangePicker
                        bufferFilters={bufferFilters}
                        setBufferFilters={setBufferFilters}
                    />
                </div>
                <div className="flex w-full flex-col items-center">
                    <YearRangeDropown setBufferFilters={setBufferFilters} />
                </div>
            </div>
        </div>
    );
};

export default FilterControls;

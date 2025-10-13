import type { DateRange, OnSelectHandler } from "react-day-picker";
import type {
    OffsetLimit,
    SummarySortBy,
} from "@/shared-components/SummaryTypes";
import { format } from "date-fns";
import type { Setter } from "@/utils/types";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type FilterControlParams = {
    range: DateRange | undefined;
    offsetLimit: OffsetLimit;
    setRange: Setter<DateRange | undefined>;
    setOffsetLimit: Setter<OffsetLimit> | undefined;
    setSortByArtists: Setter<SummarySortBy> | undefined;
    setSortByTracks: Setter<SummarySortBy> | undefined;
};
const FilterControls = ({
    range,
    offsetLimit,
    setRange,
    setOffsetLimit,
    setSortByArtists,
    setSortByTracks,
}: FilterControlParams) => {
    const display =
        range?.from && range.to
            ? `${format(range.from, "LLL dd, y")} ${format(range.to, "LLL dd, y")}`
            : "Pick a date range";
    return (
        <div className="flex flex-col items-center">
            <div className="text-spotify-green text-2xl font-bold">
                Filter Controls
            </div>
            <div className="my-2 flex flex-col items-center justify-center text-center">
                <div className="underline">Date Range</div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="mt-1 justify-center text-center font-normal"
                        >
                            {display}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                            mode="range"
                            selected={range}
                            onSelect={(value) => setRange(value)}
                            numberOfMonths={2}
                            required={false}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default FilterControls;

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { SummaryFilters } from "@/shared-components/SummaryTypes";

interface Props {
    bufferFilters: SummaryFilters;
    setBufferFilters: React.Dispatch<React.SetStateAction<SummaryFilters>>;
}

const DateRangePicker: React.FC<Props> = ({
    bufferFilters,
    setBufferFilters,
}) => {
    const { range } = bufferFilters;

    const handleStartChange = (newFrom: Date | undefined) =>
        setBufferFilters((prev) => ({
            ...prev,
            range: { from: newFrom, to: prev.range?.to },
        }));

    const handleEndChange = (newTo: Date | undefined) =>
        setBufferFilters((prev) => ({
            ...prev,
            range: { from: prev.range?.from, to: newTo },
        }));

    const display =
        range?.from && range.to
            ? `${format(range.from, "LLL dd, y")} – ${format(range.to, "LLL dd, y")}`
            : "Pick a date range";

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center">
                <div className="mx-2">Start Date:</div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-[160px] justify-start text-left"
                        >
                            {range?.from
                                ? format(range.from, "LLL dd, y")
                                : "Start date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                        <Calendar
                            mode="single"
                            selected={range?.from}
                            onSelect={handleStartChange}
                            disabled={(date) => !!range?.to && date > range.to}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center">
                <div className="mx-2">End Date:</div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-[160px] justify-start text-left"
                        >
                            {range?.to
                                ? format(range.to, "LLL dd, y")
                                : "End date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                        <Calendar
                            mode="single"
                            selected={range?.to}
                            onSelect={handleEndChange}
                            disabled={(date) =>
                                !!range?.from && date < range.from
                            }
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Optional combined display */}
            <div className="ml-3 flex items-center text-sm">
                Range: {display}
            </div>
        </div>
    );
};

export default DateRangePicker;

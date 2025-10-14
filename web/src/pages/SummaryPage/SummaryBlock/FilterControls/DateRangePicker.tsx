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

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <label className="text-muted-foreground w-24 shrink-0 text-sm">
                    Start Date
                </label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-8 w-[140px] justify-start text-left font-normal"
                        >
                            {range?.from ? (
                                <span>{format(range.from, "LLL dd, y")}</span>
                            ) : (
                                <span className="text-muted-foreground">
                                    Select date
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        align="center"
                        className="bg-background w-auto border p-2 shadow-md"
                    >
                        <Calendar
                            mode="single"
                            selected={range?.from}
                            onSelect={handleStartChange}
                            disabled={(date) => !!range?.to && date > range.to}
                            captionLayout="dropdown"
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center gap-2">
                <label className="text-muted-foreground w-24 shrink-0 text-sm">
                    End Date
                </label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-8 w-[140px] justify-start text-left font-normal"
                        >
                            {range?.to ? (
                                <span>{format(range.to, "LLL dd, y")}</span>
                            ) : (
                                <span className="text-muted-foreground">
                                    Select date
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        align="center"
                        className="bg-background w-auto border p-2 shadow-md"
                    >
                        <Calendar
                            mode="single"
                            selected={range?.to}
                            onSelect={handleEndChange}
                            disabled={(date) =>
                                !!range?.from && date < range.from
                            }
                            captionLayout="dropdown"
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default DateRangePicker;

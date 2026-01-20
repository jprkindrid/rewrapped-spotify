import { format } from "date-fns";
import { lazy, Suspense } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { SummaryFilters } from "@/types/Summary";
import type { Dispatch, SetStateAction } from "react";
import type { ChartFilters } from "@/types/Bump";

const Calendar = lazy(() =>
    import("@/components/ui/calendar").then((mod) => ({
        default: mod.Calendar,
    }))
);

type DateRangeParams<T extends SummaryFilters | ChartFilters> = {
    bufferFilters: T;
    setBufferFilters: Dispatch<SetStateAction<T>>;
};

const DateRangePicker = <T extends SummaryFilters | ChartFilters>({
    bufferFilters,
    setBufferFilters,
}: DateRangeParams<T>) => {
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
        <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="flex items-center gap-2 sm:flex-col">
                <label className="text-muted-foreground w-24 shrink-0 text-sm sm:w-auto">
                    Start Date
                </label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-8 w-32 justify-start text-left font-normal"
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
                        <Suspense fallback={<div>Loading...</div>}>
                            <Calendar
                                mode="single"
                                selected={range?.from}
                                onSelect={handleStartChange}
                                disabled={(date) =>
                                    !!range?.to && date > range.to
                                }
                                captionLayout="dropdown"
                            />
                        </Suspense>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center gap-2 sm:flex-col">
                <label className="text-muted-foreground w-24 shrink-0 text-sm sm:w-auto">
                    End Date
                </label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-8 w-32 justify-start text-left font-normal"
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
                        <Suspense fallback={<div>Loading...</div>}>
                            <Calendar
                                mode="single"
                                selected={range?.to}
                                onSelect={handleEndChange}
                                disabled={(date) =>
                                    !!range?.from && date < range.from
                                }
                                captionLayout="dropdown"
                            />
                        </Suspense>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default DateRangePicker;

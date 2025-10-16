import type { SummaryFilters } from "@/shared-components/SummaryTypes";
import type { Setter } from "@/utils/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";

type Props = {
    setBufferFilters: Setter<SummaryFilters>;
};

const YearRangeDropown = ({ setBufferFilters }: Props) => {
    const [yearDropOpen, setYearDropOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const years = Array.from({ length: 2025 - 2011 + 1 }, (_, i) => 2011 + i);

    const handleSelect = (y: number) => {
        const yearStart = new Date(y, 0, 1);
        const yearEnd = new Date(y, 11, 31);
        setSelectedYear(y);
        setYearDropOpen(false);
        setBufferFilters((prev: SummaryFilters) => ({
            ...prev,
            range: { from: yearStart, to: yearEnd },
        }));
    };
    return (
        <div className="flex items-center gap-2 sm:mx-3 sm:flex-col sm:text-center">
            <label className="text-muted-foreground w-24 shrink-0 text-sm sm:w-auto">
                By Year
            </label>
            <Popover open={yearDropOpen} onOpenChange={setYearDropOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-8 w-32 justify-between text-left font-normal"
                        onClick={() => setYearDropOpen((o) => !o)}
                    >
                        {selectedYear ?? (
                            <span className="text-muted-foreground">
                                Select year
                            </span>
                        )}
                        <svg
                            className="ml-2 h-4 w-4 opacity-50"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="bg-popover text-popover-foreground w-32 rounded-md border p-0 shadow-md"
                >
                    <ul className="max-h-48 overflow-y-auto py-1 text-sm">
                        {years.map((y) => (
                            <li key={y}>
                                <button
                                    onClick={() => handleSelect(y)}
                                    className={`block rounded-sm px-3 py-1.5 text-left text-sm transition-colors ${
                                        y === selectedYear
                                            ? "bg-accent text-accent-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                >
                                    {y}
                                </button>
                            </li>
                        ))}
                    </ul>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default YearRangeDropown;

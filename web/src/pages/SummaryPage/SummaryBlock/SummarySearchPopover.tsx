import { useState, useCallback, useRef, useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSummarySearchQuery } from "@/hooks/useSummarySearchQuery";
import { useSearchImages } from "@/hooks/useSearchImages";
import { useDarkMode } from "@/hooks/useDarkMode";
import { formatTime } from "@/utils/formatTime";
import type { SummarySearchEntry } from "@/types/Summary";
import type { EntityType, SortBy } from "@/types/Shared";
import type { DateRange } from "react-day-picker";
import { Search, Loader2 } from "lucide-react";

type SummarySearchPopoverProps = {
    token: string;
    demo: boolean;
    displayType: EntityType;
    range: DateRange | undefined;
    sortBy: SortBy;
};

const SummarySearchPopover = ({
    token,
    demo,
    displayType,
    range,
    sortBy,
}: SummarySearchPopoverProps) => {
    const isDark = useDarkMode();
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const entity = displayType === "artists" ? "artist" : "track";
    const searchQuery = useSummarySearchQuery(
        debouncedQuery,
        entity,
        range,
        sortBy,
        token,
        demo
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                setDebouncedQuery(value.trim());
            }, 300);
        },
        []
    );

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setInputValue("");
            setDebouncedQuery("");
        }
    }, []);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const results = searchQuery.data?.results ?? [];
    const imageType = displayType === "artists" ? "artists" : "tracks";
    const imageQuery = useSearchImages(
        results.map((result) => ({
            name: result.name,
            totalMs: result.totalMs,
            count: result.count,
            uri: result.uri,
        })),
        imageType,
        token,
        demo,
        12
    );

    const isSearching =
        searchQuery.isFetching ||
        (debouncedQuery !== inputValue.trim() && inputValue.trim().length >= 2);
    const hasResults = results.length > 0;
    const showNoResults =
        debouncedQuery.length >= 2 &&
        !searchQuery.isFetching &&
        searchQuery.isSuccess &&
        !hasResults;

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isDark
                            ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                    aria-label="Search summary"
                >
                    <Search className="size-3.5" />
                    <span>Search</span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={`mt-[4.5px] w-96 p-0 ${
                    isDark
                        ? "border-neutral-700 bg-neutral-900"
                        : "border-neutral-200 bg-white"
                }`}
                align="end"
                sideOffset={8}
            >
                <div
                    className={`flex items-center gap-2 border-b px-3 py-2.5 ${
                        isDark ? "border-neutral-700" : "border-neutral-200"
                    }`}
                >
                    <Search
                        className={`size-4 flex-shrink-0 ${
                            isDark ? "text-neutral-500" : "text-neutral-400"
                        }`}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={
                            displayType === "artists"
                                ? "Search artists in this range..."
                                : "Search tracks in this range..."
                        }
                        className={`w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 ${
                            isDark ? "text-neutral-100" : "text-neutral-900"
                        }`}
                    />
                    {isSearching && (
                        <Loader2 className="size-4 flex-shrink-0 animate-spin text-neutral-400" />
                    )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                    {hasResults &&
                        results.map((result) => (
                            <ResultRow
                                key={`${result.entity}-${result.name}-${result.artistName ?? ""}`}
                                result={result}
                                isDark={isDark}
                                imageUrl={imageQuery.data?.[result.uri]?.imageUrl ?? ""}
                                imageLoading={imageQuery.isFetching}
                            />
                        ))}

                    {showNoResults && (
                        <div className="px-3 py-6 text-center text-sm text-neutral-500">
                            No results found for &ldquo;{debouncedQuery}&rdquo;
                        </div>
                    )}

                    {debouncedQuery.length < 2 && inputValue.length > 0 && (
                        <div className="px-3 py-6 text-center text-sm text-neutral-500">
                            Type at least 2 characters to search
                        </div>
                    )}

                    {inputValue.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-neutral-500">
                            Search ranked {displayType} for the selected timespan
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

type ResultRowProps = {
    result: SummarySearchEntry;
    isDark: boolean;
    imageUrl: string;
    imageLoading: boolean;
};

const ResultRow = ({ result, isDark, imageUrl, imageLoading }: ResultRowProps) => {
    const showSubtext = result.entity === "track" && !!result.artistName;

    return (
        <div
            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-50"
            }`}
        >
            <div
                className={`flex size-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${
                    isDark ? "bg-neutral-800" : "bg-neutral-100"
                }`}
            >
                {imageLoading ? (
                    <div className="size-full animate-pulse rounded-full bg-neutral-700" />
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={result.name}
                        className="size-full object-cover"
                    />
                ) : null}
            </div>

            <div className="min-w-0 flex-1">
                <div
                    className={`truncate text-sm font-medium ${
                        isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                >
                    {result.name}
                </div>
                {showSubtext && (
                    <div className="truncate text-xs text-neutral-500">
                        {result.artistName}
                    </div>
                )}
                <div className="text-xs text-neutral-500">
                    #{result.rangeRank} in range · {result.rangeCount} plays · {" "}
                    {formatTime(result.rangeTotalMs)}
                </div>
            </div>
        </div>
    );
};

export default SummarySearchPopover;

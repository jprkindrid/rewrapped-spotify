import { useState, useCallback, useRef, useEffect, useId } from "react";
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
    onSelectQuery: (query: string) => void;
};

// The summary filter matches artist names on the artists tab and track names on
// the tracks tab, so filter by the field the result was matched on.
const filterTextFor = (result: SummarySearchEntry) =>
    result.entity === "track" && result.trackName
        ? result.trackName
        : result.name;

const SummarySearchPopover = ({
    token,
    demo,
    displayType,
    range,
    sortBy,
    onSelectQuery,
}: SummarySearchPopoverProps) => {
    const isDark = useDarkMode();
    const listboxId = useId();
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
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
            setActiveIndex(-1);

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
            setActiveIndex(-1);
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
    const activeResult =
        activeIndex >= 0 && activeIndex < results.length
            ? results[activeIndex]
            : undefined;

    const selectQuery = (query: string) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return;
        onSelectQuery(trimmed);
        handleOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" && hasResults) {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % results.length);
        } else if (e.key === "ArrowUp" && hasResults) {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            selectQuery(
                activeResult ? filterTextFor(activeResult) : inputValue
            );
        }
    };

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
                        onKeyDown={handleKeyDown}
                        role="combobox"
                        aria-label={`Search ${displayType}`}
                        aria-expanded={hasResults}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            activeResult
                                ? `${listboxId}-${activeIndex}`
                                : undefined
                        }
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
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-label={`Matching ${displayType}`}
                    >
                        {hasResults &&
                            results.map((result, i) => (
                                <ResultRow
                                    key={`${result.entity}-${result.name}-${result.artistName ?? ""}`}
                                    id={`${listboxId}-${i}`}
                                    result={result}
                                    isDark={isDark}
                                    isActive={i === activeIndex}
                                    imageUrl={
                                        imageQuery.data?.[result.uri]
                                            ?.imageUrl ?? ""
                                    }
                                    imageLoading={imageQuery.isFetching}
                                    onSelect={() =>
                                        selectQuery(filterTextFor(result))
                                    }
                                />
                            ))}
                    </div>

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

                    {hasResults && (
                        <div className="border-t border-neutral-200 px-3 py-2 text-[11px] text-neutral-500 dark:border-neutral-700">
                            Select a result, or press Enter to filter by &ldquo;
                            {inputValue.trim()}&rdquo;
                        </div>
                    )}

                    {inputValue.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-neutral-500">
                            Search ranked {displayType} for the selected
                            timespan
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

type ResultRowProps = {
    id: string;
    result: SummarySearchEntry;
    isDark: boolean;
    isActive: boolean;
    imageUrl: string;
    imageLoading: boolean;
    onSelect: () => void;
};

const ResultRow = ({
    id,
    result,
    isDark,
    isActive,
    imageUrl,
    imageLoading,
    onSelect,
}: ResultRowProps) => {
    const showSubtext = result.entity === "track" && !!result.artistName;
    const activeBg = isDark ? "bg-neutral-800" : "bg-neutral-50";

    return (
        <button
            type="button"
            id={id}
            role="option"
            aria-selected={isActive}
            onClick={onSelect}
            className={`focus-visible:ring-spotify-green flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${
                isActive ? activeBg : ""
            } ${isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-50"}`}
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
                    #{result.rangeRank} in range · {result.rangeCount} plays ·{" "}
                    {formatTime(result.rangeTotalMs)}
                </div>
            </div>
        </button>
    );
};

export default SummarySearchPopover;

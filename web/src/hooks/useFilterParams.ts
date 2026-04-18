import { useState, useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import type { SortBy, ChartInterval } from "@/types/Shared";

export interface FilterSearchParams {
    demo: boolean;
    from?: string;
    to?: string;
    sortBy?: string;
    interval?: string;
}

const DEFAULT_FROM = new Date(2011, 0, 1);
const DEFAULT_TO = new Date();
const DEFAULT_SORT_BY: SortBy = "count";
const DEFAULT_INTERVAL: ChartInterval = "yearly";


function parseDate(v: string | undefined, fallback: Date): Date {
    if (!v) return fallback;
    const d = new Date(v);
    return isNaN(d.getTime()) ? fallback : d;
}

function toDateParam(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export function useSummaryFilterParams() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as FilterSearchParams;

    const filtersFromUrl = {
        range: {
            from: parseDate(search.from, DEFAULT_FROM),
            to: parseDate(search.to, DEFAULT_TO),
        } as DateRange,
        sortBy: (search.sortBy as SortBy) ?? DEFAULT_SORT_BY,
        offsetLimit: { offsetTracks: 0, offsetArtists: 0, limit: 10 },
    };

    const [bufferFilters, setBufferFilters] = useState(filtersFromUrl);

    const writeToUrl = useCallback(
        (f: typeof filtersFromUrl) => {
            const params: FilterSearchParams = {
                demo: search.demo,
                from: f.range?.from ? toDateParam(f.range.from) : undefined,
                to: f.range?.to ? toDateParam(f.range.to) : undefined,
                sortBy: f.sortBy,
            };
            navigate({ search: params as never, replace: true });
        },
        [navigate, search.demo],
    );

    const handleApply = useCallback(() => {
        writeToUrl(bufferFilters);
    }, [bufferFilters, writeToUrl]);

    const handleReset = useCallback(() => {
        const defaults = {
            range: { from: DEFAULT_FROM, to: DEFAULT_TO } as DateRange,
            sortBy: DEFAULT_SORT_BY as SortBy,
            offsetLimit: { offsetTracks: 0, offsetArtists: 0, limit: 10 },
        };
        setBufferFilters(defaults);
        writeToUrl(defaults);
    }, [writeToUrl]);

    return {
        filters: filtersFromUrl,
        bufferFilters,
        setBufferFilters,
        handleApply,
        handleReset,
        demo: search.demo ?? false,
    };
}

export function useChartsFilterParams() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as FilterSearchParams;

    const filtersFromUrl = {
        range: {
            from: parseDate(search.from, DEFAULT_FROM),
            to: parseDate(search.to, DEFAULT_TO),
        } as DateRange,
        sortBy: (search.sortBy as SortBy) ?? DEFAULT_SORT_BY,
        interval: (search.interval as ChartInterval) ?? DEFAULT_INTERVAL,
    };

    const [bufferFilters, setBufferFilters] = useState(filtersFromUrl);

    const writeToUrl = useCallback(
        (f: typeof filtersFromUrl) => {
            const params: FilterSearchParams = {
                demo: search.demo,
                from: f.range?.from ? toDateParam(f.range.from) : undefined,
                to: f.range?.to ? toDateParam(f.range.to) : undefined,
                sortBy: f.sortBy,
                interval: f.interval,
            };
            navigate({ search: params as never, replace: true });
        },
        [navigate, search.demo],
    );

    const handleApply = useCallback(() => {
        writeToUrl(bufferFilters);
    }, [bufferFilters, writeToUrl]);

    const handleReset = useCallback(() => {
        const defaults = {
            range: { from: DEFAULT_FROM, to: DEFAULT_TO } as DateRange,
            sortBy: DEFAULT_SORT_BY as SortBy,
            interval: DEFAULT_INTERVAL as ChartInterval,
        };
        setBufferFilters(defaults);
        writeToUrl(defaults);
    }, [writeToUrl]);

    return {
        filters: filtersFromUrl,
        bufferFilters,
        setBufferFilters,
        handleApply,
        handleReset,
        demo: search.demo ?? false,
    };
}

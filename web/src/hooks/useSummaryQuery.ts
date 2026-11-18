import type { DateRange } from "react-day-picker";
import type { SummaryResponse } from "../types/Summary";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as summaryService from "../services/summary";
import type { SortBy } from "@/types/Shared";

export function useSummaryQuery(
    range: DateRange | undefined,
    offsetTracks: number,
    offsetArtists: number,
    limit: number,
    sortBy: SortBy,
    query: string,
    token: string,
    demo: boolean
) {
    type SummaryKey = [
        string,
        DateRange,
        number,
        number,
        number,
        SortBy,
        string,
        string,
        boolean,
    ];

    return useQuery<SummaryResponse, Error, SummaryResponse, SummaryKey>({
        queryKey: [
            "summary",
            range,
            offsetTracks,
            offsetArtists,
            limit,
            sortBy,
            query,
            token,
            demo,
        ] as SummaryKey,
        queryFn: ({ queryKey }: QueryFunctionContext<SummaryKey>) => {
            const [, range, offsetTracks, offsetArtists, limit, sortBy, query] =
                queryKey;

            return summaryService.getUserSummary({
                start: new Date(range.from!),
                end: new Date(range.to!),
                offsetArtists: offsetArtists,
                offsetTracks: offsetTracks,
                limit: limit,
                sortBy: sortBy,
                query: query,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseSummaryQueryResult = ReturnType<typeof useSummaryQuery>;

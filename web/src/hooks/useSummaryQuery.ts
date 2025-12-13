import type { DateRange } from "react-day-picker";
import type {
    SummarySortBy,
    SummaryResponse,
} from "../shared-components/SummaryTypes";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as summaryService from "../services/summary";

export function useSummaryQuery(
    range: DateRange | undefined,
    offsetTracks: number,
    offsetArtists: number,
    limit: number,
    sortBy: SummarySortBy,
    token: string,
    demo: boolean
) {
    type SummaryKey = [
        string,
        DateRange,
        number,
        number,
        number,
        SummarySortBy,
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
            token,
            demo,
        ] as SummaryKey,
        queryFn: ({ queryKey }: QueryFunctionContext<SummaryKey>) => {
            const [, range, offsetTracks, offsetArtists, limit, sortBy] =
                queryKey;

            return summaryService.getUserSummary({
                start: range.from!,
                end: range.to!,
                offsetArtists: offsetArtists,
                offsetTracks: offsetTracks,
                limit: limit,
                sortBy: sortBy,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseSummaryQueryResult = ReturnType<typeof useSummaryQuery>;

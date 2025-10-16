import type { DateRange } from "react-day-picker";
import type {
    SummarySortBy,
    SummmaryResponse,
} from "../shared-components/SummaryTypes";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as summaryService from "../services/summary";

export function useSummaryQuery(
    range: DateRange | undefined,
    offsetTracks: number,
    offsetArtists: number,
    limit: number,
    sortBy: SummarySortBy
) {
    type SummaryKey = [
        string,
        DateRange,
        number,
        number,
        number,
        SummarySortBy,
    ];

    return useQuery<SummmaryResponse, Error, SummmaryResponse, SummaryKey>({
        queryKey: [
            "summary",
            range,
            offsetTracks,
            offsetArtists,
            limit,
            sortBy,
        ] as SummaryKey,
        queryFn: ({ queryKey }: QueryFunctionContext<SummaryKey>) => {
            const [, range, offsetTracks, offsetArtists, limit, sortBy] =
                queryKey;
            console.log("in hook", offsetArtists, offsetTracks, limit);

            return summaryService.getUserSummary({
                start: range.from!,
                end: range.to!,
                offsetArtists: offsetArtists,

                offsetTracks: offsetTracks,
                limit: limit,
                sortBy: sortBy,
            });
        },
        retry: false,
    });
}

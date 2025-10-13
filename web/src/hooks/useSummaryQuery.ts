import type { DateRange } from "react-day-picker";
import type {
    OffsetLimit,
    SummarySortBy,
    SummmaryResponse,
} from "../shared-components/SummaryTypes";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as summaryService from "../services/summary";

export function useSummaryQuery(
    range: DateRange | undefined,
    offsetLimit: OffsetLimit,
    sortBy: SummarySortBy
) {
    type SummaryKey = [string, DateRange, OffsetLimit, SummarySortBy];

    return useQuery<SummmaryResponse, Error, SummmaryResponse, SummaryKey>({
        queryKey: ["summary", range, offsetLimit, sortBy] as SummaryKey,
        queryFn: ({ queryKey }: QueryFunctionContext<SummaryKey>) => {
            const [, range, offsetLimit, sortBy] = queryKey;
            return summaryService.getUserSummary({
                start: range.from!,
                end: range.to!,
                offsetTracks: offsetLimit.offsetTracks!,
                offsetArtists: offsetLimit.offsetArtists!,
                limit: offsetLimit.limit!,
                sortBy: sortBy,
            });
        },
        retry: false,
    });
}

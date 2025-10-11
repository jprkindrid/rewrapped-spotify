import type { DateRange } from "react-day-picker";
import type {
    OffsetLimit,
    SummmaryResponse,
} from "../shared-components/SummaryTypes";
import { useQuery } from "@tanstack/react-query";
import * as summaryService from "../services/summary";

export function useSummaryQuery(range: DateRange, offsetLimit: OffsetLimit) {
    return useQuery<SummmaryResponse>({
        queryKey: ["summary", range, offsetLimit],
        queryFn: ({ queryKey }) => {
            const [, range, offsetLimit] = queryKey as [
                string,
                DateRange,
                OffsetLimit,
            ];
            return summaryService.getUserSummary({
                start: range.from!,
                end: range.to!,
                offsetTracks: offsetLimit.offsetTracks!,
                offsetArtists: offsetLimit.offsetArtists!,
                limit: offsetLimit.limit!,
            });
        },
        retry: false,
    });
}

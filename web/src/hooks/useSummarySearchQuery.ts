import type {
    SummarySearchEntity,
    SummarySearchResponse,
} from "@/types/Summary";
import type { DateRange } from "react-day-picker";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as summarySearchService from "@/services/summarySearch";
import type { SortBy } from "@/types/Shared";

export function useSummarySearchQuery(
    query: string,
    entity: SummarySearchEntity,
    range: DateRange | undefined,
    sortBy: SortBy,
    token: string,
    demo: boolean
) {
    type SearchKey = [
        string,
        string,
        SummarySearchEntity,
        DateRange | undefined,
        SortBy,
        string,
        boolean,
    ];

    return useQuery<SummarySearchResponse, Error, SummarySearchResponse, SearchKey>({
        queryKey: [
            "summary-search",
            query,
            entity,
            range,
            sortBy,
            token,
            demo,
        ] as SearchKey,
        queryFn: ({ queryKey }: QueryFunctionContext<SearchKey>) => {
            const [, searchQuery, searchEntity, searchRange, searchSortBy] = queryKey;

            return summarySearchService.searchSummary({
                query: searchQuery,
                entity: searchEntity,
                start: new Date(searchRange!.from!),
                end: new Date(searchRange!.to!),
                sortBy: searchSortBy,
                token: token,
                demo: demo,
            });
        },
        enabled: query.length >= 2 && !!range?.from && !!range?.to,
        staleTime: 1000 * 30,
        retry: false,
    });
}

export type UseSummarySearchQueryResult = ReturnType<typeof useSummarySearchQuery>;

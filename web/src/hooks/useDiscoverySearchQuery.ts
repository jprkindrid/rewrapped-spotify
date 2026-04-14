import type { DateRange } from "react-day-picker";
import type { DiscoverySearchResponse } from "@/types/Charts";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as discoverySearchService from "@/services/discoverySearch";

export function useDiscoverySearchQuery(
    range: DateRange | undefined,
    query: string,
    token: string,
    demo: boolean
) {
    type SearchKey = [string, DateRange | undefined, string, string, boolean];

    return useQuery<
        DiscoverySearchResponse,
        Error,
        DiscoverySearchResponse,
        SearchKey
    >({
        queryKey: [
            "discovery-search",
            range,
            query,
            token,
            demo,
        ] as SearchKey,
        queryFn: ({
            queryKey,
        }: QueryFunctionContext<SearchKey>) => {
            const [, range, query] = queryKey;

            return discoverySearchService.searchDiscoveryArtists({
                start: range!.from!,
                end: range!.to!,
                query: query,
                token: token,
                demo: demo,
            });
        },
        enabled: query.length >= 2 && !!range?.from && !!range?.to,
        staleTime: 1000 * 30,
        retry: false,
    });
}

export type UseDiscoverySearchQueryResult = ReturnType<
    typeof useDiscoverySearchQuery
>;

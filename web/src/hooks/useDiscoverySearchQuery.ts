import type { DiscoverySearchResponse } from "@/types/charts/discovery";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as discoverySearchService from "@/services/discoverySearch";

export function useDiscoverySearchQuery(
    query: string,
    token: string,
    demo: boolean
) {
    type SearchKey = [string, string, string, boolean];

    return useQuery<
        DiscoverySearchResponse,
        Error,
        DiscoverySearchResponse,
        SearchKey
    >({
        queryKey: ["discovery-search", query, token, demo] as SearchKey,
        queryFn: ({ queryKey }: QueryFunctionContext<SearchKey>) => {
            const [, query] = queryKey;

            return discoverySearchService.searchDiscoveryArtists({
                query: query,
                token: token,
                demo: demo,
            });
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 30,
        retry: false,
    });
}

export type UseDiscoverySearchQueryResult = ReturnType<
    typeof useDiscoverySearchQuery
>;

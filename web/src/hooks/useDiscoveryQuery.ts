import type { DateRange } from "react-day-picker";
import type { DiscoveryResponse } from "@/types/charts/discovery";
import type { SortBy } from "@/types/Shared";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as discoveryService from "../services/discovery";

export function useDiscoveryQuery(
    range: DateRange | undefined,
    sortBy: SortBy,
    token: string,
    demo: boolean
) {
    type DiscoveryKey = [string, DateRange, SortBy, string, boolean];

    return useQuery<DiscoveryResponse, Error, DiscoveryResponse, DiscoveryKey>({
        queryKey: ["discovery", range, sortBy, token, demo] as DiscoveryKey,
        queryFn: ({ queryKey }: QueryFunctionContext<DiscoveryKey>) => {
            const [, range, sortBy] = queryKey;

            return discoveryService.getUserDiscovery({
                start: new Date(range.from!),
                end: new Date(range.to!),
                sortBy: sortBy,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseDiscoveryQueryResult = ReturnType<typeof useDiscoveryQuery>;

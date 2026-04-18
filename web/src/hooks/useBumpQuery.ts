import type { DateRange } from "react-day-picker";
import type { BumpResponse } from "@/types/charts/bump";
import type { ChartInterval } from "@/types/Shared";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as bumpService from "../services/bump";
import type { SortBy } from "@/types/Shared";

export function useBumpQuery(
    range: DateRange | undefined,
    sortBy: SortBy,
    interval: ChartInterval,
    token: string,
    demo: boolean,
    enabled: boolean = true
) {
    type BumpKey = [string, DateRange, SortBy, ChartInterval, string, boolean];

    return useQuery<BumpResponse, Error, BumpResponse, BumpKey>({
        queryKey: [
            "bumpchart",
            range,
            sortBy,
            interval,
            token,
            demo,
        ] as BumpKey,
        queryFn: ({ queryKey }: QueryFunctionContext<BumpKey>) => {
            const [, range, sortBy, interval] = queryKey;

            return bumpService.getUserBump({
                start: new Date(range.from!),
                end: new Date(range.to!),
                sortBy: sortBy,
                interval: interval,
                token: token,
                demo: demo,
            });
        },
        retry: false,
        enabled: enabled,
    });
}

export type UseBumpQueryResult = ReturnType<typeof useBumpQuery>;

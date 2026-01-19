import type { DateRange } from "react-day-picker";
import type { SortBy } from "../types/Summary";
import type { BumpResponse, ChartInterval } from "@/types/Bump";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as bumpService from "../services/bump";

export function useBumpQuery(
    range: DateRange | undefined,
    sortBy: SortBy,
    interval: ChartInterval,
    token: string,
    demo: boolean
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
                start: range.from!,
                end: range.to!,
                sortBy: sortBy,
                interval: interval,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseBumpQueryResult = ReturnType<typeof useBumpQuery>;

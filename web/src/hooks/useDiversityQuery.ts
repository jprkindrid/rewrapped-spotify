import type { DateRange } from "react-day-picker";
import type { DiversityResponse } from "@/types/charts/discovery";
import type { ChartInterval } from "@/types/Shared";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as diversityService from "../services/diversity";

export function useDiversityQuery(
    range: DateRange | undefined,
    interval: ChartInterval,
    token: string,
    demo: boolean
) {
    type DiversityKey = [string, DateRange, ChartInterval, string, boolean];

    return useQuery<DiversityResponse, Error, DiversityResponse, DiversityKey>({
        queryKey: ["diversity", range, interval, token, demo] as DiversityKey,
        queryFn: ({ queryKey }: QueryFunctionContext<DiversityKey>) => {
            const [, range, interval] = queryKey;

            return diversityService.getUserDiversity({
                start: new Date(range.from!),
                end: new Date(range.to!),
                interval: interval,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseDiversityQueryResult = ReturnType<typeof useDiversityQuery>;

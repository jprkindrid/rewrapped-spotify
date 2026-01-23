import type { DateRange } from "react-day-picker";
import type { ChartInterval } from "@/types/Bump";
import type { ListeningTimeResponse } from "@/types/Shared";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as listeningTimeService from "../services/listeningtime";

export function useListeningTimeQuery(
    range: DateRange | undefined,
    interval: ChartInterval,
    token: string,
    demo: boolean
) {
    type ListeningTimeKey = [string, DateRange, ChartInterval, string, boolean];

    return useQuery<
        ListeningTimeResponse,
        Error,
        ListeningTimeResponse,
        ListeningTimeKey
    >({
        queryKey: [
            "listeningtime",
            range,
            interval,
            token,
            demo,
        ] as ListeningTimeKey,
        queryFn: ({ queryKey }: QueryFunctionContext<ListeningTimeKey>) => {
            const [, range, interval] = queryKey;

            return listeningTimeService.getUserListeningTime({
                start: range.from!,
                end: range.to!,
                interval: interval,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseListeningTimeQueryResult = ReturnType<
    typeof useListeningTimeQuery
>;

import type { DateRange } from "react-day-picker";
import type { ListeningClockResponse } from "@/types/charts/listening";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as listeningClockService from "../services/listeningclock";

export function useListeningClockQuery(
    range: DateRange | undefined,
    token: string,
    demo: boolean
) {
    type ListeningClockKey = [string, DateRange, string, boolean];

    return useQuery<
        ListeningClockResponse,
        Error,
        ListeningClockResponse,
        ListeningClockKey
    >({
        queryKey: ["listeningclock", range, token, demo] as ListeningClockKey,
        queryFn: ({ queryKey }: QueryFunctionContext<ListeningClockKey>) => {
            const [, range] = queryKey;

            return listeningClockService.getUserListeningClock({
                start: new Date(range.from!),
                end: new Date(range.to!),
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseListeningClockQueryResult = ReturnType<
    typeof useListeningClockQuery
>;

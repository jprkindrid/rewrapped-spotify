import type { DateRange } from "react-day-picker";
import type { StreaksResponse } from "@/types/charts/streaks";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import * as streaksService from "../services/streaks";

export function useStreaksQuery(
    range: DateRange | undefined,
    token: string,
    demo: boolean
) {
    type StreaksKey = [string, DateRange, string, boolean];

    return useQuery<StreaksResponse, Error, StreaksResponse, StreaksKey>({
        queryKey: ["streaks", range, token, demo] as StreaksKey,
        queryFn: ({ queryKey }: QueryFunctionContext<StreaksKey>) => {
            const [, range] = queryKey;

            return streaksService.getUserStreaks({
                start: range.from!,
                end: range.to!,
                token: token,
                demo: demo,
            });
        },
        retry: false,
    });
}

export type UseStreaksQueryResult = ReturnType<typeof useStreaksQuery>;

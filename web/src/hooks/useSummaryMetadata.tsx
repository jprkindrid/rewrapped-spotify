import * as summaryService from "@/services/summary";
import type { SummaryEntry } from "@/types/Summary";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";

export function useSummaryMetadata(
    displayType: string,
    items: SummaryEntry[] | undefined,
    token: string,
    demo: boolean
) {
    const itemsKey = items?.map((item) => item.URI).join(",") ?? "";

    type MetadataKey = [string, string, string, string, boolean];
    return useQuery({
        queryKey: [
            "summary-meta-data",
            displayType,
            itemsKey,
            token,
            demo,
        ] as MetadataKey,
        queryFn: ({ queryKey }: QueryFunctionContext<MetadataKey>) => {
            const [, type, , token, demo] = queryKey;

            return summaryService.getUserSummaryMetadata({
                type: type,
                items: items!,
                token: token,
                demo: demo,
            });
        },
        enabled: !!items && items?.length > 0,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
}

export type UseSummaryMetadataResult = ReturnType<typeof useSummaryMetadata>;

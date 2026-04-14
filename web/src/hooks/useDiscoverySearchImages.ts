import type { DiscoverySearchEntry } from "@/types/Charts";
import type { SummaryMetaEntry } from "@/types/Summary";
import { useQuery } from "@tanstack/react-query";
import * as summaryService from "@/services/summary";

export function useDiscoverySearchImages(
    artists: DiscoverySearchEntry[] | undefined,
    token: string,
    demo: boolean
) {
    const urisKey = artists?.map((a) => a.uri).join(",") ?? "";

    return useQuery<SummaryMetaEntry[], Error>({
        queryKey: ["discovery-search-images", urisKey, token, demo],
        queryFn: () => {
            const items = artists!.map((a) => ({
                Name: a.name,
                TotalMs: a.totalMs,
                Count: a.count,
                URI: a.uri,
            }));

            return summaryService.getUserSummaryMetadata({
                type: "artists",
                items: items,
                token: token,
                demo: demo,
            });
        },
        enabled: !!artists && artists.length > 0,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
}

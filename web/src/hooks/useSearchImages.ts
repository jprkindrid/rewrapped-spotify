import { useQuery } from "@tanstack/react-query";
import * as summaryService from "@/services/summary";

type SearchImageType = "artists" | "tracks";

type SearchImageItem = {
    name: string;
    totalMs: number;
    count: number;
    uri: string;
};

type SearchImageMap = Record<string, { imageUrl: string; itemUrl: string }>;

export function useSearchImages(
    items: SearchImageItem[] | undefined,
    type: SearchImageType,
    token: string,
    demo: boolean,
    maxItems = 12
) {
    const filteredItems = (items ?? []).filter((item) => !!item.uri).slice(0, maxItems);

    const uniqueItems = Array.from(
        new Map(filteredItems.map((item) => [item.uri, item])).values()
    );

    const urisKey = uniqueItems.map((item) => item.uri).join(",");

    return useQuery<SearchImageMap, Error>({
        queryKey: ["search-images", type, urisKey, token, demo],
        queryFn: async () => {
            const entries = uniqueItems.map((item) => ({
                Name: item.name,
                TotalMs: item.totalMs,
                Count: item.count,
                URI: item.uri,
            }));

            const metadata = await summaryService.getUserSummaryMetadata({
                type: type,
                items: entries,
                token: token,
                demo: demo,
            });

            const byUri: SearchImageMap = {};
            metadata.forEach((meta, index) => {
                const uri = uniqueItems[index]?.uri;
                if (!uri) return;
                byUri[uri] = {
                    imageUrl: meta.ImageURL,
                    itemUrl: meta.ItemURL,
                };
            });

            return byUri;
        },
        enabled: uniqueItems.length > 0,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: false,
    });
}

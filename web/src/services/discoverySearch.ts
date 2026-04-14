import type {
    DiscoverySearchParams,
    DiscoverySearchResponse,
} from "@/types/Charts";
import { apiFetch } from "./apiFetch";

export async function searchDiscoveryArtists({
    query,
    token,
    demo,
}: DiscoverySearchParams): Promise<DiscoverySearchResponse> {
    const params = new URLSearchParams({
        query: query,
    });

    const reqURL = demo
        ? "/api/demo/discovery/search"
        : "/api/discovery/search";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok)
        throw new Error(
            `Failed to search discovery artists: ${res.statusText}`
        );
    return await res.json();
}

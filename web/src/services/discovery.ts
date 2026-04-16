import type {
    DiscoveryParams,
    DiscoveryResponse,
} from "@/types/charts/discovery";
import { apiFetch } from "./apiFetch";

export async function getUserDiscovery({
    start,
    end,
    sortBy,
    token,
    demo,
}: DiscoveryParams): Promise<DiscoveryResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        sort_by: sortBy.toString(),
    });

    const reqURL = demo ? "/api/demo/discovery" : "/api/discovery";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok)
        throw new Error(`Failed to fetch discovery data: ${res.statusText}`);
    return await res.json();
}

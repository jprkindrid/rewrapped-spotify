import type {
    SummarySearchParams,
    SummarySearchResponse,
} from "@/types/Summary";
import { apiFetch } from "./apiFetch";

export async function searchSummary({
    query,
    entity,
    start,
    end,
    sortBy,
    token,
    demo,
    limit,
    offset,
}: SummarySearchParams): Promise<SummarySearchResponse> {
    const params = new URLSearchParams({
        query: query,
        entity: entity,
        start: start.toISOString(),
        end: end.toISOString(),
        sort_by: sortBy,
    });

    if (typeof limit === "number") {
        params.set("limit", String(limit));
    }

    if (typeof offset === "number") {
        params.set("offset", String(offset));
    }

    const reqURL = demo ? "/api/demo/summary/search" : "/api/summary/search";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok) {
        throw new Error(`Failed to search summary: ${res.statusText}`);
    }
    return await res.json();
}

import type { BumpParams, BumpResponse } from "@/types/Bump";
import { apiFetch } from "./apiFetch";

export async function getUserBump({
    start,
    end,
    sortBy,
    interval,
    token,
    demo,
}: BumpParams): Promise<BumpResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        sort_by: sortBy.toString(),
        interval: interval,
    });

    const reqURL = demo ? "/api/demo/bumpchart" : "/api/bumpchart";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("GET", reqString, token, {}, demo);
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
    const data = await res.json();
    return data;
}

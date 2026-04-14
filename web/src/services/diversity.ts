import type { DiversityParams, DiversityResponse } from "@/types/Charts";
import { apiFetch } from "./apiFetch";

export async function getUserDiversity({
    start,
    end,
    interval,
    token,
    demo,
}: DiversityParams): Promise<DiversityResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        interval: interval,
    });

    const reqURL = demo ? "/api/demo/diversity" : "/api/diversity";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok)
        throw new Error(`Failed to fetch diversity data: ${res.statusText}`);
    return await res.json();
}

import type { StreaksParams, StreaksResponse } from "@/types/Charts";
import { apiFetch } from "./apiFetch";

export async function getUserStreaks({
    start,
    end,
    token,
    demo,
}: StreaksParams): Promise<StreaksResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
    });

    const reqURL = demo ? "/api/demo/streaks" : "/api/streaks";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok)
        throw new Error(`Failed to fetch streaks data: ${res.statusText}`);
    return await res.json();
}

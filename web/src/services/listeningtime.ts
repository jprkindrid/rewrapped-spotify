import type { ListeningTimeParams, ListeningTimeResponse } from "@/types/Shared";
import { apiFetch } from "./apiFetch";

export async function getUserListeningTime({
    start,
    end,
    interval,
    token,
    demo,
}: ListeningTimeParams): Promise<ListeningTimeResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        interval: interval,
    });

    const reqURL = demo ? "/api/demo/listeningtime" : "/api/listeningtime";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok)
        throw new Error(`Failed to fetch listening time: ${res.statusText}`);
    const data = await res.json();
    return data;
}

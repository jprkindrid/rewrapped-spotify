import type {
    ListeningClockParams,
    ListeningClockResponse,
} from "@/types/charts/listening";
import { apiFetch } from "./apiFetch";

export async function getUserListeningClock({
    start,
    end,
    token,
    demo,
}: ListeningClockParams): Promise<ListeningClockResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
    });

    const reqURL = demo ? "/api/demo/listeningclock" : "/api/listeningclock";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("POST", reqString, token, {}, demo);
    if (!res.ok)
        throw new Error(`Failed to fetch listening clock: ${res.statusText}`);
    return await res.json();
}

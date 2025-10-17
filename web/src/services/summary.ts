import type {
    SummaryParams,
    SummmaryResponse,
} from "../shared-components/SummaryTypes";
import { apiFetch } from "./apiFetch";

export async function getUserSummary({
    start,
    end,
    offsetArtists,
    offsetTracks,
    limit,
    sortBy,
    token,
}: SummaryParams): Promise<SummmaryResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        offset_tracks: offsetTracks.toString(),
        offset_artists: offsetArtists.toString(),
        limit: limit.toString(),
        sort_by: sortBy.toString(),
    });

    const reqString = `/api/summary?${params.toString()}`;
    const res = await apiFetch("GET", reqString, token);
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
    const data = await res.json();
    return data;
}

export async function deleteData(token: string) {
    return await apiFetch("DELETE", "/api/delete", token);
}

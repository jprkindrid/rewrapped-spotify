import type {
    SummaryParams,
    SummmaryResponse,
} from "../shared-components/SummaryTypes";
import { apiFetch } from "./apiFetch";

export async function getUserSummary({
    start,
    end,
    offsetArtists = 0,
    offsetTracks = 0,
    limit = 10,
}: SummaryParams): Promise<SummmaryResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        offsetTracks: offsetTracks.toString(),
        offsetArtists: offsetArtists.toString(),
        limit: limit.toString(),
    });
    const reqString = `/api/summary?${params.toString()}`;
    const res = await apiFetch("GET", reqString);
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
    return res.json();
}

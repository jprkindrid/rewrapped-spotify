import type {
    SummaryMetaEntry,
    SummaryMetaParams,
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
    demo,
}: SummaryParams): Promise<SummmaryResponse> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        offset_tracks: offsetTracks.toString(),
        offset_artists: offsetArtists.toString(),
        limit: limit.toString(),
        sort_by: sortBy.toString(),
    });

    const reqURL = demo ? "/api/demo/summary" : "/api/summary";
    const reqString = `${reqURL}?${params.toString()}`;
    const res = await apiFetch("GET", reqString, token, {}, demo);
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
    const data = await res.json();
    return data;
}

export async function deleteData(token: string) {
    return await apiFetch("DELETE", "/api/delete", token);
}

export async function getUserSummaryMetadata({
    type,
    items,
    token,
    demo,
}: SummaryMetaParams): Promise<SummaryMetaEntry[]> {
    const reqURL = demo ? "/api/demo/summary/images" : "/api/summary/images";

    const res = await apiFetch(
        "POST",
        reqURL,
        token,
        {
            body: JSON.stringify({
                entry_type: type,
                entries: items,
            }),
        },
        demo
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch ${type} metadata: ${res.statusText}`);
    }
    const data = res.json();
    return data;
}

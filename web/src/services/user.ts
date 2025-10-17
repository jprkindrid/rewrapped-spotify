import { apiFetch } from "./apiFetch";
import type { UserIdData } from "../shared-components/UserIdData";

export async function fetchUserIDs(): Promise<UserIdData> {
    const res = await apiFetch("GET", "/api/user?provider=spotify");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json() as Promise<UserIdData>;
}

export async function logoutUser() {
    const res = await apiFetch("POST", "/auth/logout");
    if (!res.ok) {
        throw new Error(`Error Logging Out: ${res.status}}`);
    }
    return;
}

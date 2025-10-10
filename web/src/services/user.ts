import { apiFetch } from "./apiFetch";
import type { UserIDs } from "../shared-components/UserIDs";

export async function fetchUserIDs(): Promise<UserIDs> {
  const res = await apiFetch("/api/user?provider=spotify");
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<UserIDs>;
}

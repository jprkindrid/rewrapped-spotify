import { API_URL } from "../utils/constants";

type RestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch(
  method: RestMethod,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  return res;
}

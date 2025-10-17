import { API_URL } from "../utils/constants";

type RestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch(
    method: RestMethod,
    path: string,
    token?: string,
    options: RequestInit = {}
): Promise<Response> {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${path}`, {
        method: method,
        headers,
        ...options,
    });
    return res;
}

import { API_URL } from "../utils/constants";

type RestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch(
    method: RestMethod,
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${path}`, {
        method: method,
        credentials: "include",
        headers,
        ...options,
    });
    return res;
}

import { API_URL, DEMO_KEY } from "@/config/constants";

type RestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch(
    method: RestMethod,
    path: string,
    token?: string,
    options: RequestInit = {},
    demo?: boolean
): Promise<Response> {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
        ...(demo ? { "X-Demo-Key": DEMO_KEY } : {}),
    };

    const res = await fetch(`${API_URL}${path}`, {
        method: method,
        headers,
        ...options,
    });
    return res;
}

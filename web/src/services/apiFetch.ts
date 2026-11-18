import { API_URL, DEMO_KEY, TOKEN_KEY } from "@/config/constants";

type RestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Endpoints where a 401 means "wrong credentials", not "session expired".
const AUTH_PATHS = [
    "/auth/login",
    "/auth/register",
    "/auth/verify",
    "/auth/email-link",
];

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

    if (
        res.status === 401 &&
        !AUTH_PATHS.some((authPath) => path.startsWith(authPath))
    ) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "/";
        return res;
    }

    return res;
}

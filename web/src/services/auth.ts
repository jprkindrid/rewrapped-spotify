import { apiFetch } from "./apiFetch";

export interface AuthResponse {
    token: string;
}

export async function loginUser(
    email: string,
    password: string
): Promise<AuthResponse> {
    const res = await apiFetch("POST", "/auth/login", undefined, {
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(
            message || `Login failed (${res.status})`
        );
    }

    return res.json() as Promise<AuthResponse>;
}

export async function registerUser(
    email: string,
    password: string,
    displayName?: string
): Promise<AuthResponse> {
    const res = await apiFetch("POST", "/auth/register", undefined, {
        body: JSON.stringify({
            email,
            password,
            display_name: displayName || undefined,
        }),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(
            message || `Registration failed (${res.status})`
        );
    }

    return res.json() as Promise<AuthResponse>;
}

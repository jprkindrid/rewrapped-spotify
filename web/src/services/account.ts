import { apiFetch } from "./apiFetch";

export interface TokenResponse {
    token: string;
}

export interface MessageResponse {
    message: string;
}

export async function updateEmail(
    token: string,
    newEmail: string,
    password: string
): Promise<TokenResponse> {
    const res = await apiFetch("PUT", "/api/account/email", token, {
        body: JSON.stringify({ new_email: newEmail, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
            data?.error || `Failed to update email (${res.status})`
        );
    }

    return res.json() as Promise<TokenResponse>;
}

export async function updatePassword(
    token: string,
    currentPassword: string,
    newPassword: string
): Promise<MessageResponse> {
    const res = await apiFetch("PUT", "/api/account/password", token, {
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
        }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
            data?.error || `Failed to update password (${res.status})`
        );
    }

    return res.json() as Promise<MessageResponse>;
}

export async function updateDisplayName(
    token: string,
    displayName: string
): Promise<TokenResponse> {
    const res = await apiFetch("PUT", "/api/account/display-name", token, {
        body: JSON.stringify({ display_name: displayName }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
            data?.error || `Failed to update display name (${res.status})`
        );
    }

    return res.json() as Promise<TokenResponse>;
}

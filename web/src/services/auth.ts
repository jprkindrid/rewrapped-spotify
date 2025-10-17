import { apiFetch } from "./apiFetch";

export interface ExchangeResponse {
    token: string;
}

export async function exchangeAuthCode(
    authCode: string
): Promise<ExchangeResponse> {
    const res = await apiFetch("POST", "/auth/exchange", undefined, {
        body: JSON.stringify({ auth_code: authCode }),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Auth exchange failed (${res.status}: ${message})`);
    }

    return res.json() as Promise<ExchangeResponse>;
}

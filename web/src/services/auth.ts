import { apiFetch } from "./apiFetch";

export interface AuthResponse {
    token: string;
}

export interface MessageResponse {
    message: string;
}

export type EmailLinkPurpose = "login" | "reset";

export interface VerifyResponse {
    token: string;
    purpose: "login" | "reset" | "claim";
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
    const data = await res.json().catch(() => null);
    return data?.error || `${fallback} (${res.status})`;
}

async function post<T>(
    path: string,
    body: unknown,
    fallbackError: string,
    token?: string
): Promise<T> {
    const res = await apiFetch("POST", path, token, {
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(await errorMessage(res, fallbackError));
    }
    return res.json() as Promise<T>;
}

export function loginUser(email: string, password: string) {
    return post<AuthResponse>(
        "/auth/login",
        { email, password },
        "Login failed"
    );
}

export function registerUser(
    email: string,
    password: string,
    displayName?: string
) {
    return post<AuthResponse>(
        "/auth/register",
        { email, password, display_name: displayName || undefined },
        "Registration failed"
    );
}

/** Starts a session without an account. */
export function startGuestSession() {
    return post<AuthResponse>(
        "/auth/guest",
        undefined,
        "Couldn't start a guest session"
    );
}

/** Emails a one-time sign-in or password-reset link. */
export function requestEmailLink(email: string, purpose: EmailLinkPurpose) {
    return post<MessageResponse>(
        "/auth/email-link",
        { email, purpose },
        "Couldn't send the email"
    );
}

/** Redeems the token from an emailed link for a session. */
export function verifyEmailLink(token: string) {
    return post<VerifyResponse>(
        "/auth/verify",
        { token },
        "Couldn't verify the link"
    );
}

export function refreshSession(token: string) {
    return post<AuthResponse>(
        "/auth/refresh",
        undefined,
        "Couldn't refresh session",
        token
    );
}

export interface ClaimParams {
    email: string;
    /** Omit to confirm by emailed link instead. */
    password?: string;
    displayName?: string;
}

/**
 * Turns the current guest into an account. With a password it returns a new
 * session token; without one it emails a confirmation link and returns a
 * message.
 */
export function claimGuestData(token: string, params: ClaimParams) {
    return post<Partial<AuthResponse> & Partial<MessageResponse>>(
        "/api/account/claim",
        {
            email: params.email,
            password: params.password || undefined,
            display_name: params.displayName || undefined,
        },
        "Couldn't save your data",
        token
    );
}

export interface AuthConfig {
    email_enabled: boolean;
}

/** Which sign-in options the server supports. */
export async function getAuthConfig(): Promise<AuthConfig> {
    const res = await apiFetch("GET", "/auth/config");
    if (!res.ok) {
        throw new Error(
            await errorMessage(res, "Couldn't load sign-in options")
        );
    }
    return res.json() as Promise<AuthConfig>;
}

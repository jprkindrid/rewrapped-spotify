// src/context/AuthProvider.tsx
import { useState, type ReactNode, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthContextType } from "./AuthContext";
import { refreshSession } from "@/services/auth";
import { TOKEN_KEY } from "@/config/constants";

interface JWTPayload {
    sub?: string;
    exp?: number;
    display_name?: string;
    guest?: boolean;
    has_password?: boolean;
    pwreset?: boolean;
}

interface Session {
    token: string;
    claims: JWTPayload;
}

// Renew account sessions once they have less than this long left, so people
// who keep using the app stay signed in.
const REFRESH_WITHIN_MS = 7 * 24 * 60 * 60 * 1000;

function decodeSession(token: string): Session | null {
    try {
        const claims = jwtDecode<JWTPayload>(token);
        if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
        // Tokens from before accounts became optional used the email as the
        // subject and have no version claim; the server rejects them anyway.
        if (!claims.sub || claims.sub.includes("@")) return null;
        return { token, claims };
    } catch {
        return null;
    }
}

function loadSavedSession(): Session | null {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) return null;
    const session = decodeSession(saved);
    if (!session) localStorage.removeItem(TOKEN_KEY);
    return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(loadSavedSession);

    const login = useCallback((jwt: string) => {
        const next = decodeSession(jwt);
        if (!next) {
            console.error("Received an invalid or expired session token");
            return;
        }
        localStorage.setItem(TOKEN_KEY, jwt);
        setSession(next);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setSession(null);
    }, []);

    const token = session?.token ?? null;
    const claims = session?.claims;

    useEffect(() => {
        if (!token || !claims?.exp || claims.guest || claims.pwreset) return;
        if (claims.exp * 1000 - Date.now() > REFRESH_WITHIN_MS) return;

        let cancelled = false;
        refreshSession(token)
            .then((data) => {
                if (!cancelled) login(data.token);
            })
            .catch((err) => console.warn("Session refresh failed:", err));
        return () => {
            cancelled = true;
        };
    }, [token, claims, login]);

    const value: AuthContextType = {
        token,
        userId: claims?.sub ?? null,
        displayName: claims?.display_name ?? null,
        isGuest: claims?.guest ?? false,
        hasPassword: claims?.has_password ?? false,
        isPasswordReset: claims?.pwreset ?? false,
        expiresAt: claims?.exp ? new Date(claims.exp * 1000) : null,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

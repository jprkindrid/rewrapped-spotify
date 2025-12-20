// src/context/AuthProvider.tsx
import { useState, type ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthContextType } from "./AuthContext";

type JWTClaimValue = string | number | boolean | null | undefined;

interface JWTPayload {
    sub?: string;
    exp?: number;
    display_name?: string;
    [key: string]: JWTClaimValue | JWTClaimValue[];
}

const TOKEN_KEY = "spotify_rewrapped_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            try {
                const decoded = jwtDecode<JWTPayload>(savedToken);
                const now = Math.floor(Date.now() / 1000);

                if (decoded.exp && decoded.exp > now) {
                    setToken(savedToken);
                    setUserId(decoded.sub ?? null);
                    setDisplayName(decoded.display_name ?? null);
                } else {
                    localStorage.removeItem(TOKEN_KEY);
                }
            } catch (err) {
                console.error("Invalid saved JWT:", err);
                localStorage.removeItem(TOKEN_KEY);
            }
        }
    }, []);

    const login = (jwt: string) => {
        setToken(jwt);
        localStorage.setItem(TOKEN_KEY, jwt);

        try {
            const decoded = jwtDecode<JWTPayload>(jwt);
            setUserId(decoded.sub ?? null);
            setDisplayName(decoded.display_name ?? null);
        } catch (err) {
            console.error("Invalid JWT:", err);
            setUserId(null);
            setDisplayName(null);
        }
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setDisplayName(null);
        localStorage.removeItem(TOKEN_KEY);
    };

    const value: AuthContextType = {
        token,
        userId,
        displayName,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

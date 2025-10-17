// src/context/AuthProvider.tsx
import { useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthContextType } from "./AuthContext";

type JWTClaimValue = string | number | boolean | null | undefined;

interface JWTPayload {
    sub?: string;
    exp?: number;
    display_name?: string;
    [key: string]: JWTClaimValue | JWTClaimValue[];
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);

    const login = (jwt: string) => {
        setToken(jwt);

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

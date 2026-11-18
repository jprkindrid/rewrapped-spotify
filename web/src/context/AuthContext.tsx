import { createContext } from "react";

export interface AuthContextType {
    token: string | null;
    userId: string | null;
    displayName: string | null;
    /** Signed in without an account; data expires at `expiresAt`. */
    isGuest: boolean;
    /** False for accounts created from an email link that never set one. */
    hasPassword: boolean;
    /** Short-lived session opened from a password-reset link. */
    isPasswordReset: boolean;
    expiresAt: Date | null;
    login: (jwt: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

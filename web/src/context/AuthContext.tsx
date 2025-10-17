import { createContext } from "react";

export interface AuthContextType {
    token: string | null;
    userId: string | null;
    displayName: string | null;
    login: (jwt: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

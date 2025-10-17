import { jwtDecode } from "jwt-decode";

type JWTClaimValue = string | number | boolean | null | undefined;

export interface JWTPayload {
    sub?: string;
    exp?: number;
    display_name?: string;
    [key: string]: JWTClaimValue | JWTClaimValue[];
}

export function decodeJwt(token: string): JWTPayload | null {
    try {
        return jwtDecode<JWTPayload>(token);
    } catch (err) {
        console.error("Invalid JWT:", err);
        return null;
    }
}

import { useQuery } from "@tanstack/react-query";
import { getAuthConfig } from "@/services/auth";

/**
 * Whether email sign-in links, password resets and email confirmation are
 * available. False until the server says otherwise, so options never show up
 * and then fail.
 */
export function useEmailEnabled(): boolean {
    const { data } = useQuery({
        queryKey: ["auth-config"],
        queryFn: getAuthConfig,
        staleTime: Infinity,
        retry: false,
    });
    return data?.email_enabled ?? false;
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./useAuth";

export function useLogout() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { logout: logout } = useAuth();

    return useMutation({
        mutationFn: async () => {
            logout();
        },
        onSuccess: () => {
            queryClient.clear();
            navigate({ to: "/" });
        },
    });
}

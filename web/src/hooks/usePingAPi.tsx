import { useEffect } from "react";
import { API_URL } from "@/config/constants";

export function usePingApi() {
    useEffect(() => {
        fetch(`${API_URL}/health`).catch(() => {});
    }, []);
}

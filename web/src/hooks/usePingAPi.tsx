import { useEffect } from "react";
import { API_URL } from "@/utils/constants";

export function usePingApi() {
    useEffect(() => {
        fetch(`${API_URL}/health`).catch(() => {});
    }, []);
}

import { isDarkMode } from "@/utils/theme";
import { useEffect, useState } from "react";

export function useDarkMode() {
    const [dark, setDark] = useState(isDarkMode());

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDark(isDarkMode());
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    return dark;
}

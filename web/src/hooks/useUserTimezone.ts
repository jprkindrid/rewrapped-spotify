import { useEffect, useState } from "react";

export function useUserTimezone(): string {
    const [timezone, setTimezone] = useState<string>("UTC");

    useEffect(() => {
        try {
            const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setTimezone(detectedTz);
        } catch {
            // Fallback to UTC if detection fails
            setTimezone("UTC");
        }
    }, []);

    return timezone;
}

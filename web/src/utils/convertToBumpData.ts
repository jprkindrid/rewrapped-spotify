import type { BumpEntry } from "@/types/Bump";

export const convertToBumpData = (entries: BumpEntry[]) => {
    if (!entries || entries.length === 0) return [];

    const allPeriods = new Set<string>();
    entries.forEach((entry) => {
        entry.timeline.forEach((item) => {
            allPeriods.add(item.period);
        });
    });

    let sortedPeriods = Array.from(allPeriods).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
    );

    if (sortedPeriods.length > 0 && sortedPeriods[0].includes("-")) {
        sortedPeriods = sortedPeriods.slice(-24);
    }

    const displayPeriods = sortedPeriods.map((period) => {
        if (period.includes("-")) {
            const [year, month] = period.split("-");
            const monthIndex = parseInt(month) - 1;
            const monthName = new Date(0, monthIndex).toLocaleString("en-US", {
                month: "short",
            });
            return `${monthName} ${year}`;
        }
        return period;
    });

    return entries.map((entry) => {
        const dataMap = new Map(
            entry.timeline.map((item) => [item.period, item.rank])
        );

        return {
            id: entry.name,
            data: displayPeriods.map((period, index) => ({
                x: period,
                y: dataMap.get(sortedPeriods[index]) ?? null,
            })),
        };
    });
};

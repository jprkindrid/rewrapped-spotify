import type { DiscoveryEntry } from "@/types/Charts";
import { formatTime } from "@/utils/formatTime";
import { useMemo } from "react";

type DiscoveryChartContentProps = {
    artists: DiscoveryEntry[];
    isDark: boolean;
    isMobile: boolean;
};

const DiscoveryChartContent = ({
    artists,
    isDark,
    isMobile,
}: DiscoveryChartContentProps) => {
    const formattedArtists = useMemo(() => {
        return artists.map((artist) => {
            const date = new Date(artist.firstListen + "T00:00:00");
            return {
                ...artist,
                dateLabel: date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                }),
                fullDateLabel: date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                }),
            };
        });
    }, [artists]);

    // Group by year for the timeline
    const yearGroups = useMemo(() => {
        const groups = new Map<string, typeof formattedArtists>();
        for (const artist of formattedArtists) {
            const year = artist.firstListen.substring(0, 4);
            if (!groups.has(year)) {
                groups.set(year, []);
            }
            groups.get(year)!.push(artist);
        }
        return Array.from(groups.entries()).sort(([a], [b]) =>
            a.localeCompare(b)
        );
    }, [formattedArtists]);

    return (
        <div className="space-y-6 px-2 pb-6">
            {yearGroups.map(([year, yearArtists]) => (
                <div key={year}>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="bg-spotify-green rounded-full px-3 py-1 text-sm font-bold text-black">
                            {year}
                        </span>
                        <div
                            className={`h-px flex-1 ${isDark ? "bg-neutral-700" : "bg-neutral-300"}`}
                        />
                    </div>
                    <div
                        className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
                    >
                        {yearArtists.map((artist) => (
                            <div
                                key={artist.name}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                                    isDark
                                        ? "bg-neutral-800/50 hover:bg-neutral-800"
                                        : "bg-neutral-100 hover:bg-neutral-200"
                                }`}
                            >
                                <div
                                    className="bg-spotify-green h-2 w-2 flex-shrink-0 rounded-full"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">
                                        {artist.name}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {artist.fullDateLabel}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-right text-xs text-neutral-500">
                                    <div>
                                        {artist.count}{" "}
                                        {artist.count === 1
                                            ? "play"
                                            : "plays"}
                                    </div>
                                    <div>{formatTime(artist.totalMs)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DiscoveryChartContent;

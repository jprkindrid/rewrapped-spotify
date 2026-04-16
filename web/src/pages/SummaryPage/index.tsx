import NavBar from "@/components/NavBar";
import type { SummaryFilters } from "@/types/Summary";
import type { OffsetLimit } from "@/types/Shared";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import SummaryBlock from "./SummaryBlock";
import FilterControls from "../../components/FilterControls";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useSummaryMetadata } from "@/hooks/useSummaryMetadata";
import type { EntityType } from "@/types/Shared";

const initialRange: DateRange = {
    from: new Date(2011, 0, 1),
    to: new Date(),
};

const initialOffsetLimit: OffsetLimit = {
    offsetTracks: 0,
    offsetArtists: 0,
    limit: 10,
};

export const SummaryPage = () => {
    const [displayType, setDisplayType] = useState<EntityType>("artists");
    const navigate = useNavigate();
    const { token } = useAuth();
    const { demo } = useSearch({ strict: false }) as { demo: boolean };

    if (!token && !demo) {
        navigate({ to: "/" });
    }

    const initialFilters: SummaryFilters = {
        range: initialRange,
        sortBy: "count",
        offsetLimit: initialOffsetLimit,
    };

    const [filters, setFilters] = useState<SummaryFilters>(initialFilters);

    const [bufferFilters, setBufferFilters] = useState(filters);

    const handleApply = () => setFilters(bufferFilters);
    const handleReset = () => {
        setBufferFilters(initialFilters);
        setFilters(initialFilters);
    };
    const summaryQuery = useSummaryQuery(
        filters.range,
        filters.offsetLimit.offsetTracks,
        filters.offsetLimit.offsetArtists,
        filters.offsetLimit.limit,
        filters.sortBy,
        token!,
        demo
    );

    const metaRequestData =
        displayType === "artists"
            ? summaryQuery.data?.top_artists
            : summaryQuery.data?.top_tracks;

    const metaQuery = useSummaryMetadata(
        displayType,
        metaRequestData,
        token!,
        demo
    );

    return (
        <div className="flex w-full flex-col">
            <NavBar includeUser={!demo} />
            <div className="bg-background flex min-h-screen flex-col items-center py-8 font-sans transition">
                <div className="relative h-full w-full max-w-5xl">
                    <section className="page-section mx-3 mb-6 rounded-xl">
                        <FilterControls
                            bufferFilters={bufferFilters}
                            setBufferFilters={setBufferFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </section>
                    {demo && (
                        <div className="flex w-full justify-center text-center">
                            <div className="text-spotify-green border-spotify-green/20 bg-spotify-green/5 mb-6 w-fit rounded-lg border px-6 py-3 text-sm font-semibold">
                                Demo Data Courtesy of{" "}
                                <a
                                    className="hover:text-foreground underline transition-colors"
                                    href="https://www.kindridmusic.com/"
                                    target="_blank"
                                >
                                    Kindrid
                                </a>
                            </div>
                        </div>
                    )}
                    <section className="page-section mx-3 flex flex-col overflow-hidden rounded-xl">
                        <SummaryBlock
                            displayType={displayType}
                            setDisplayType={setDisplayType}
                            offsetLimit={filters.offsetLimit}
                            setFilters={setFilters}
                            summaryQuery={summaryQuery}
                            metaQuery={metaQuery}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;

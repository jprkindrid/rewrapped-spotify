import NavBar from "@/shared-components/NavBar";
import {
    type OffsetLimit,
    type SummaryDisplay,
    type SummaryFilters,
} from "@/shared-components/SummaryTypes";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import SummaryBlock from "./SummaryBlock";
import FilterControls from "./FilterControls";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useSummaryMetadata } from "@/hooks/useSummaryMetadata";

const initialRange: DateRange = {
    from: new Date(2011, 0, 1),
    to: new Date(),
};

const initialOffsetLimit: OffsetLimit = {
    offsetTracks: 0,
    offsetArtists: 0,
    limit: 10,
};

export const SummaryPage = ({ demo = false }) => {
    const [displayType, setDisplayType] = useState<SummaryDisplay>("artists");
    const navigate = useNavigate();
    const { token } = useAuth();

    if (!token && !demo) {
        navigate({ to: "/" });
    }

    const [filters, setFilters] = useState<SummaryFilters>({
        range: initialRange,
        sortBy: "count",
        offsetLimit: initialOffsetLimit,
    });

    const [bufferFilters, setBufferFilters] = useState(filters);

    const handleApply = () => setFilters(bufferFilters);
    const handleReset = () => setBufferFilters(filters);

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
            <div className="text-spotify-black flex min-h-screen flex-col items-center bg-linear-to-b from-white via-neutral-50 to-white py-8 font-sans transition dark:from-neutral-900 dark:via-neutral-950 dark:to-black dark:text-white">
                <div className="relative h-full w-full max-w-5xl">
                    <section className="page-section mx-2 mb-6 flex justify-center rounded-lg pb-2 shadow-sm">
                        <FilterControls
                            bufferFilters={bufferFilters}
                            setBufferFilters={setBufferFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </section>
                    {demo && (
                        <div className="flex w-full justify-center text-center">
                            <div className="dark:text-spotify-green page-section bg-spotify-black text-spotify-black mb-6 w-fit rounded-lg px-6 py-3 text-lg font-bold shadow-md">
                                <div>
                                    Demo Data Courtesy of{" "}
                                    <a
                                        className="hover:text-spotify-green underline dark:hover:text-white"
                                        href="https://www.kindridmusic.com/"
                                        target="_blank"
                                    >
                                        Kindrid
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                    <section className="page-section mx-2 flex flex-col rounded-lg shadow-md">
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

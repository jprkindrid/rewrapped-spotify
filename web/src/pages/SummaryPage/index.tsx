import NavBar from "@/components/NavBar";
import { useState } from "react";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import SummaryBlock from "./SummaryBlock";
import FilterControls from "../../components/FilterControls";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useSummaryMetadata } from "@/hooks/useSummaryMetadata";
import type { EntityType } from "@/types/Shared";
import { useSummaryFilterParams } from "@/hooks/useFilterParams";

export const SummaryPage = () => {
    const [displayType, setDisplayType] = useState<EntityType>("artists");
    const navigate = useNavigate();
    const { token } = useAuth();

    const {
        filters,
        bufferFilters,
        setBufferFilters,
        handleApply,
        handleReset,
        demo,
    } = useSummaryFilterParams();

    const [offsetLimit, setOffsetLimit] = useState(filters.offsetLimit);

    if (!token && !demo) {
        navigate({ to: "/" });
    }

    const summaryQuery = useSummaryQuery(
        filters.range,
        offsetLimit.offsetTracks,
        offsetLimit.offsetArtists,
        offsetLimit.limit,
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
                            offsetLimit={offsetLimit}
                            setOffsetLimit={setOffsetLimit}
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

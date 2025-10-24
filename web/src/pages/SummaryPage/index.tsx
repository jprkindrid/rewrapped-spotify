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

export const SummaryPage = ({ demo = false }) => {
    const [displayType, setDisplayType] = useState<SummaryDisplay>("artists");
    const navigate = useNavigate();

    const { token: token } = useAuth();

    if (!token && !demo) {
        navigate({ to: "/" });
    }

    const initialRange: DateRange = {
        from: new Date(2011, 0, 1),
        to: new Date(),
    };

    const initialOffsetLimit: OffsetLimit = {
        offsetTracks: 0,
        offsetArtists: 0,
        limit: 10,
    };

    const [filters, setFilters] = useState<SummaryFilters>({
        range: initialRange,
        sortBy: "count",
        offsetLimit: initialOffsetLimit,
    });

    const [bufferFilters, setBufferFilters] = useState(filters);

    const handleApply = () => setFilters(bufferFilters);
    const handleReset = () => setBufferFilters(filters);

    const {
        data: summaryData,
        isLoading: summaryIsLoading,
        error: summaryError,
    } = useSummaryQuery(
        filters.range,
        filters.offsetLimit.offsetTracks,
        filters.offsetLimit.offsetArtists,
        filters.offsetLimit.limit,
        filters.sortBy,
        token!,
        demo
    );

    const metaRequestData =
        displayType == "artists"
            ? summaryData?.top_artists
            : summaryData?.top_tracks;

    const {
        data: metaData,
        isLoading: metaIsLoading,
        error: metaError,
    } = useSummaryMetadata(displayType, metaRequestData, token!, demo);

    return (
        <div className="flex w-full flex-col">
            {/* <div className="absolute left-1/2 z-60 h-screen w-[2px] bg-red-500"></div> */}
            <NavBar includeUser={!demo} />
            <div className="text-spotify-black flex min-h-screen flex-col items-center bg-white py-4 font-sans transition dark:bg-black dark:text-white">
                <div className="relative h-full w-full max-w-5xl">
                    <section className="page-section mx-2 mb-4 flex justify-center rounded-md pb-2">
                        <FilterControls
                            bufferFilters={bufferFilters}
                            setBufferFilters={setBufferFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </section>
                    {demo && (
                        <div className="flex w-full justify-center text-center">
                            <div className="dark:text-spotify-green page-section bg-spotify-black text-spotify-black mb-4 w-fit rounded-md px-4 py-2 text-lg font-bold">
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
                    <section className="page-section mx-2 flex flex-col rounded-lg">
                        <SummaryBlock
                            displayType={displayType}
                            setDisplayType={setDisplayType}
                            offsetLimit={filters.offsetLimit}
                            summaryData={summaryData}
                            summaryIsLoading={summaryIsLoading}
                            summaryError={summaryError}
                            setFilters={setFilters}
                            metaData={metaData}
                            metaIsLoading={metaIsLoading}
                            metaError={metaError}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;

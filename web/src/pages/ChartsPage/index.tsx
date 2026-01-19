import NavBar from "@/components/NavBar";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import FilterControls from "../../components/FilterControls";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearch } from "@tanstack/react-router";
import BumpChart from "./BumpChart";
import { useBumpQuery } from "@/hooks/useBumpQuery";
import type { ChartFilters } from "@/types/Bump";

const initialRange: DateRange = {
    from: new Date(2011, 0, 1),
    to: new Date(),
};

export const ChartsPage = () => {
    // const [displayType, setDisplayType] = useState<EntityType>("artists");
    const navigate = useNavigate();
    const { token } = useAuth();

    const { demo } = useSearch({ strict: false }) as { demo: boolean };

    if (!token && !demo) {
        navigate({ to: "/" });
    }

    const [filters, setFilters] = useState<ChartFilters>({
        range: initialRange,
        sortBy: "count",
        interval: "yearly",
    });

    const [bufferFilters, setBufferFilters] = useState(filters);

    const handleApply = () => setFilters(bufferFilters);
    const handleReset = () => setBufferFilters(filters);

    const bumpQuery = useBumpQuery(
        filters.range,
        filters.sortBy,
        filters.interval,
        token!,
        demo
    );

    // const metaRequestData =
    //     displayType === "artists"
    //         ? summaryQuery.data?.top_artists
    //         : summaryQuery.data?.top_tracks;

    // const metaQuery = useSummaryMetadata(
    //     displayType,
    //     metaRequestData,
    //     token!,
    //     demo
    // );

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
                        <BumpChart bumpQuery={bumpQuery} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ChartsPage;

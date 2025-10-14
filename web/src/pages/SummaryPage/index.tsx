import { useQuery } from "@tanstack/react-query";
import * as userService from "@/services/user";
import NavBar from "@/shared-components/NavBar";
import type { UserIdData } from "@/shared-components/UserIdData";
import {
    type OffsetLimit,
    type SummaryFilters,
} from "@/shared-components/SummaryTypes";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import SummaryBlock from "./SummaryBlock";
import FilterControls from "./SummaryBlock/FilterControls";

export const SummaryPage = () => {
    const [displayType, setDisplayType] = useState<"tracks" | "artists">(
        "artists"
    );

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

    const { data: userIdData } = useQuery<UserIdData>({
        queryKey: ["userIDs"],
        queryFn: userService.fetchUserIDs,
        retry: false,
        staleTime: 60_000,
    });

    const {
        data: summaryData,
        isLoading: summaryIsLoading,
        error: summaryError,
    } = useSummaryQuery(filters.range, filters.offsetLimit, filters.sortBy);

    return (
        <>
            <NavBar userIdData={userIdData} includeUser={true} />
            <div className="dark:bg-spotify-black text-spotify-black flex h-full w-full flex-col items-center justify-center bg-white py-4 font-sans transition sm:pb-16 dark:text-white">
                <div className="w-full max-w-5xl">
                    <div className="border-spotify-black/50 mb-4 flex justify-center rounded-md border px-4 pb-2 dark:border-white/50">
                        <FilterControls
                            bufferFilters={bufferFilters}
                            setBufferFilters={setBufferFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </div>
                    <div className="flex flex-col">
                        <SummaryBlock
                            displayType={displayType}
                            setDisplayType={setDisplayType}
                            summaryData={summaryData}
                            offsetLimit={filters.offsetLimit}
                            isLoading={summaryIsLoading}
                            error={summaryError}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummaryPage;

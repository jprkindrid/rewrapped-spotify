import { useQuery } from "@tanstack/react-query";
import * as userService from "@/services/user";
import NavBar from "@/shared-components/NavBar";
import type { UserIdData } from "@/shared-components/UserIdData";
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

export const SummaryPage = () => {
    const { data: userIdData } = useQuery<UserIdData>({
        queryKey: ["userIDs"],
        queryFn: userService.fetchUserIDs,
        retry: false,
        staleTime: 60_000,
    });

    const [displayType, setDisplayType] = useState<SummaryDisplay>("artists");

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
        filters.sortBy
    );

    return (
        <div className="flex w-full flex-col">
            {/* <div className="absolute left-1/2 z-60 h-screen w-[2px] bg-red-500"></div> */}
            <NavBar userIdData={userIdData} includeUser={true} />
            <div className="text-spotify-black dark:bg-spotify-black flex min-h-screen flex-col items-center bg-white py-4 font-sans transition dark:text-white">
                <div className="relative h-full w-full max-w-5xl">
                    <div className="shadow:md mx-2 mb-4 flex justify-center rounded-md border border-stone-500/10 pb-2 shadow-md dark:border-white/50">
                        <FilterControls
                            bufferFilters={bufferFilters}
                            setBufferFilters={setBufferFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </div>
                    <div className="mx-2 flex flex-col">
                        <SummaryBlock
                            displayType={displayType}
                            setDisplayType={setDisplayType}
                            summaryData={summaryData}
                            offsetLimit={filters.offsetLimit}
                            isLoading={summaryIsLoading}
                            error={summaryError}
                            setFilters={setFilters}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;

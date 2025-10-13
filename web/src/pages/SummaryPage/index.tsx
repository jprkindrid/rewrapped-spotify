import { useQuery } from "@tanstack/react-query";
import * as userService from "@/services/user";
import NavBar from "@/shared-components/NavBar";
import type { UserIdData } from "@/shared-components/UserIdData";
import {
    type SummarySortBy,
    type OffsetLimit,
} from "@/shared-components/SummaryTypes";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import SummaryBlock from "./SummaryBlock";
import FilterControls from "./SummaryBlock/FilterControls";

export const SummaryPage = () => {
    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(2011, 0, 1),
        to: new Date(),
    } as DateRange);

    const [offsetLimit, setOffsetLimit] = useState<OffsetLimit>({
        offsetTracks: 0,
        offsetArtists: 0,
        limit: 10,
    });

    const [displayType, setDisplayType] = useState<"tracks" | "artists">(
        "artists"
    );

    const [sortByArtists, setSortByArtists] = useState<SummarySortBy>("count"); // TODO: make this one parameter
    const [sortByTracks, setSortByTracks] = useState<SummarySortBy>("count");

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
    } = useSummaryQuery(range, offsetLimit, sortByArtists, sortByTracks);

    return (
        <>
            <NavBar userIdData={userIdData} includeUser={true} />
            <div className="dark:bg-spotify-black text-spotify-black relative flex h-screen flex-col items-center justify-center bg-white font-sans transition dark:text-white">
                <div className="border-spotify-black/50 mt-4 flex w-full max-w-5xl justify-center rounded-md border p-4 dark:border-white/50">
                    <FilterControls
                        range={range}
                        setRange={setRange}
                        offsetLimit={offsetLimit}
                        setOffsetLimit={setOffsetLimit}
                        setSortByArtists={setSortByArtists}
                        setSortByTracks={setSortByTracks}
                    />
                </div>
                <div className="flex h-full w-full max-w-5xl flex-col">
                    <SummaryBlock
                        displayType={displayType}
                        setDisplayType={setDisplayType}
                        summaryData={summaryData}
                        offsetLimit={offsetLimit}
                        isLoading={summaryIsLoading}
                        error={summaryError}
                    />
                </div>
            </div>
        </>
    );
};

export default SummaryPage;

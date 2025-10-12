import { useQuery } from "@tanstack/react-query";
import * as userService from "../../services/user";
import NavBar from "../../shared-components/NavBar";
import type { UserIdData } from "../../shared-components/UserIdData";
import type { OffsetLimit } from "../../shared-components/SummaryTypes";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useSummaryQuery } from "../../hooks/useSummaryQuery";
import SummaryBlock from "./SummaryBlock";

export const SummaryPage = () => {
    const [range, setRange] = useState<DateRange>({
        from: new Date(2011, 1, 1),
        to: new Date(),
    });

    const [offsetLimit, setOffsetLimit] = useState<OffsetLimit>({
        offsetTracks: 0,
        offsetArtists: 0,
        limit: 10,
    });

    const [displayType, setDisplayType] = useState<"tracks" | "artists">(
        "tracks"
    );

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
    } = useSummaryQuery(range, offsetLimit);

    console.log(summaryData);
    return (
        <>
            <NavBar userIdData={userIdData} includeUser={true} />
            <div className="dark:bg-spotify-black text-spotify-black relative flex h-screen justify-center bg-white font-sans transition dark:text-white">
                <div className="flex h-full w-full max-w-5xl flex-col">
                    <SummaryBlock
                        displayType={displayType}
                        setDisplayType={setDisplayType}
                        summaryData={summaryData}
                        setRange={setRange}
                        setOffSetLimit={setOffsetLimit}
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

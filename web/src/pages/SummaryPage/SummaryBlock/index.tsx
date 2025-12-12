import type {
    OffsetLimit,
    SummaryDisplay,
    SummaryEntry,
    SummaryFilters,
} from "@/shared-components/SummaryTypes";
import type { Setter } from "@/utils/types";
import type { UseSummaryQueryResult } from "@/hooks/useSummaryQuery";
import type { UseSummaryMetadataResult } from "@/hooks/useSummaryMetadata";
import clsx from "clsx";
import ItemLinkButton from "./ItemLinkButton";
import SummaryItem from "./SummaryItem";
import SkeletonSummaryItem from "./SkeletonSummaryItem";
import SummaryPageButtons from "./SummaryPageButtons";
import { useEffect, useState } from "react";

type SummaryBlockProps = {
    offsetLimit: OffsetLimit;
    setDisplayType: Setter<SummaryDisplay>;
    setFilters: Setter<SummaryFilters>;
    displayType: SummaryDisplay;
    summaryQuery: UseSummaryQueryResult;
    metaQuery: UseSummaryMetadataResult;
};

type ViewState = "loading" | "empty" | "data";

const getViewState = (
    isLoading: boolean,
    data: SummaryEntry[] | undefined
): ViewState => {
    if (isLoading) return "loading";
    if (!data?.length) return "empty";
    return "data";
};

const SummaryBlock = ({
    offsetLimit,
    setDisplayType,
    setFilters,
    displayType,
    summaryQuery,
    metaQuery,
}: SummaryBlockProps) => {
    const {
        data: summaryData,
        isLoading: summaryIsLoading,
        error: summaryError,
    } = summaryQuery;

    const {
        data: metaData,
        isLoading: metaIsLoading,
        error: metaError,
    } = metaQuery;

    const displayData =
        displayType === "artists"
            ? summaryData?.top_artists
            : summaryData?.top_tracks;

    const offset =
        displayType === "artists"
            ? offsetLimit.offsetArtists
            : offsetLimit.offsetTracks;

    const limit = offsetLimit.limit;

    const [showTransitions, setShowTransitions] = useState(false);

    useEffect(() => {
        if (!summaryIsLoading && displayData?.length) {
            const t = setTimeout(() => setShowTransitions(true), 50);
            return () => clearTimeout(t);
        } else {
            setShowTransitions(false);
        }
    }, [summaryIsLoading, displayData]);

    const viewState = getViewState(summaryIsLoading, displayData);

    return (
        <div className="page-section relative flex flex-1 flex-col items-center overflow-clip rounded-lg">
            {summaryError && (
                <div className="r-0 absolute top-0 flex h-full w-full flex-col items-center justify-center bg-stone-400/50 text-center text-2xl font-bold text-red-500 backdrop-blur-xs text-shadow-md dark:bg-stone-800/50">
                    <div>Error Getting Summary Data:</div>
                    <div className="text-sm">{summaryError.message}</div>
                </div>
            )}

            <div className="bg-spotify-black flex w-full justify-around overflow-clip border-b border-white/50 px-5 py-2">
                <div className="flex font-bold">
                    <button
                        className={clsx(
                            "bg-spotify-green rounded-l-md border-r border-black px-4 py-2 transition",
                            displayType !== "artists" &&
                                "text-spotify-green bg-stone-800 hover:cursor-pointer"
                        )}
                        onClick={() => setDisplayType("artists")}
                    >
                        ARTISTS
                    </button>
                    <button
                        className={clsx(
                            "bg-spotify-green rounded-r-md border-r border-black px-4 py-2 transition",
                            displayType !== "tracks" &&
                                "text-spotify-green bg-stone-800 hover:cursor-pointer"
                        )}
                        onClick={() => setDisplayType("tracks")}
                    >
                        TRACKS
                    </button>
                </div>
            </div>

            <div className="from-spotify-green/50 dark:to-spotify-black flex h-full w-full flex-col justify-between bg-linear-to-bl to-white transition dark:from-stone-800">
                {viewState === "loading" && (
                    <div className="py-2">
                        {Array.from({ length: limit }).map((_, i) => (
                            <SkeletonSummaryItem key={i} />
                        ))}
                    </div>
                )}

                {viewState === "empty" && (
                    <div className="dark:text-spotify-green text-spotify-black flex h-64 items-center justify-center font-bold text-shadow-sm dark:text-shadow-white/20">
                        No Data To Display For Current Selection
                    </div>
                )}

                {viewState === "data" &&
                    displayData!.map((item: SummaryEntry, i: number) => {
                        const meta = metaData?.[i];
                        const summaryKey = `${item.URI}-${meta?.ImageURL}`;
                        const delay = i * 20;

                        return (
                            <div
                                key={item.URI}
                                className={clsx(
                                    "border-spotify-black/50 dark:border-spotify-green/50 mx-6 my-1 flex flex-1 items-center justify-between px-2 transition duration-300",
                                    i !== 0 && "border-t",
                                    showTransitions
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-4 opacity-0"
                                )}
                                style={{ transitionDelay: `${delay}ms` }}
                            >
                                <div className="flex flex-1 items-center gap-3">
                                    <SummaryItem
                                        key={summaryKey || `loading${i}`}
                                        i={i}
                                        item={item}
                                        offset={offset}
                                        isLoading={false}
                                        displayType={displayType}
                                        imageUrl={meta?.ImageURL ?? ""}
                                        metaIsLoading={metaIsLoading}
                                        metaError={metaError}
                                    />
                                </div>
                                <div>
                                    <ItemLinkButton
                                        key={i}
                                        link={meta?.ItemURL ?? ""}
                                        metaIsLoading={metaIsLoading}
                                        metaError={metaError}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>

            <div className="border-spotify-black w-full border-t py-2 dark:border-white/50">
                <SummaryPageButtons
                    summaryData={summaryData}
                    displayType={displayType}
                    offsetLimit={offsetLimit}
                    setFilters={setFilters}
                />
            </div>
        </div>
    );
};

export default SummaryBlock;

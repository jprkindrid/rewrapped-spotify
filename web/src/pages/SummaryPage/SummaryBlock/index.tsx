import type { OffsetLimit, SummaryFilters } from "@/types/Summary";
import type { UseSummaryQueryResult } from "@/hooks/useSummaryQuery";
import type { UseSummaryMetadataResult } from "@/hooks/useSummaryMetadata";
import type { EntityType } from "@/types/Shared";
import clsx from "clsx";
import ItemLinkButton from "./ItemLinkButton";
import SummaryItem from "./SummaryItem";
import SkeletonSummaryItem from "./SkeletonSummaryItem";
import SummaryPageButtons from "./SummaryPageButtons";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import DisplayToggle from "@/components/DisplayToggle";

type SummaryBlockProps = {
    offsetLimit: OffsetLimit;
    setDisplayType: Dispatch<SetStateAction<EntityType>>;
    setFilters: Dispatch<SetStateAction<SummaryFilters>>;
    displayType: EntityType;
    summaryQuery: UseSummaryQueryResult;
    metaQuery: UseSummaryMetadataResult;
};

const SummaryBlock = ({
    offsetLimit,
    setDisplayType,
    setFilters,
    displayType,
    summaryQuery,
    metaQuery,
}: SummaryBlockProps) => {
    const { data: summaryData, status, error: summaryError } = summaryQuery;
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
        if (status === "success" && displayData?.length) {
            const t = setTimeout(() => setShowTransitions(true), 50);
            return () => clearTimeout(t);
        } else {
            setShowTransitions(false);
        }
    }, [status, displayData]);

    return (
        <div className="page-section relative flex flex-1 flex-col items-center overflow-clip rounded-lg">
            {summaryError && (
                <div className="r-0 absolute top-0 flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-400/50 text-center text-3xl font-bold text-red-500 backdrop-blur-xs text-shadow-md dark:bg-neutral-800/50">
                    <div>
                        {summaryError.message?.includes("404") ||
                        summaryError.message?.includes("Not Found")
                            ? "No Data Found"
                            : "Error Getting Summary Data:"}
                    </div>
                    <div className="text-lg">
                        {summaryError.message?.includes("404") ||
                        summaryError.message?.includes("Not Found")
                            ? "Upload your streaming history to get started"
                            : summaryError.message}
                    </div>
                </div>
            )}

            <DisplayToggle
                displayType={displayType}
                onDisplayTypeChange={setDisplayType}
            />

            <div className="from-spotify-green/20 dark:to-spotify-black flex h-full w-full flex-col justify-between bg-linear-to-br via-white/50 to-white transition dark:from-neutral-800 dark:via-neutral-800">
                {status === "pending" && (
                    <div className="py-4">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className={clsx(
                                    "mx-6 my-1 flex flex-1 items-center justify-between border-neutral-200 px-4 py-3 dark:border-neutral-500/30",
                                    i !== 0 && "border-t"
                                )}
                            >
                                <SkeletonSummaryItem />
                                {/* Button placeholder */}
                                <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200/60 dark:bg-neutral-700/40" />
                            </div>
                        ))}
                    </div>
                )}

                {status === "success" &&
                    (displayData?.length ? (
                        displayData.map((item, i) => {
                            const meta = metaData?.[i];
                            const summaryKey = `${item.URI}-${meta?.ImageURL}`;
                            const delay = i * 20;

                            return (
                                <div
                                    key={item.URI}
                                    className={clsx(
                                        "dark:border-spotify-green/30 mx-6 my-1 flex flex-1 items-center justify-between border-neutral-200 px-4 py-2 transition duration-300",
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
                                            metaStatus={metaQuery.status}
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
                        })
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                            <h2 className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                                No summary data available
                            </h2>
                            <p className="text-neutral-500">
                                Try adjusting your date range or filters.
                            </p>
                        </div>
                    ))}
            </div>

            <div className="w-full border-t border-neutral-200 py-4 dark:border-neutral-700">
                <SummaryPageButtons
                    summaryData={summaryData}
                    displayType={displayType}
                    offsetLimit={offsetLimit}
                    setFilters={setFilters}
                    isLoading={status === "pending"}
                />
            </div>
        </div>
    );
};

export default SummaryBlock;

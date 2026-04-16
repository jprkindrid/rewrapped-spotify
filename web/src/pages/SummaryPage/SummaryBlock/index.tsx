import type { SummaryFilters } from "@/types/Summary";
import type { OffsetLimit } from "@/types/Shared";
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
    const { data: metaData } = metaQuery;

    const displayData =
        displayType === "artists"
            ? summaryData?.top_artists
            : summaryData?.top_tracks;

    const offset =
        displayType === "artists"
            ? offsetLimit.offsetArtists
            : offsetLimit.offsetTracks;

    const limit = offsetLimit.limit;

    const noData = !displayData || displayData.length === 0;

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
        <div className="relative flex flex-1 flex-col items-center overflow-clip rounded-xl">
            {summaryError && (
                <div className="r-0 bg-background/80 text-destructive dark:bg-background/80 absolute top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 text-center text-3xl font-bold backdrop-blur-sm">
                    <div>
                        {summaryError.message?.includes("404") ||
                        summaryError.message?.includes("Not Found")
                            ? "No Data Found"
                            : "Error Getting Summary Data:"}
                    </div>
                    <div className="text-muted-foreground text-lg font-normal">
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
                noData={noData}
            />

            <div className="flex h-full w-full flex-col justify-between">
                {status === "pending" &&
                    Array.from({ length: limit }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className={clsx(
                                "border-border/60 mx-4 flex flex-1 items-center justify-between px-4 py-2.5 sm:mx-6 dark:border-white/[0.06]",
                                i !== 0 && "border-t"
                            )}
                        >
                            <SkeletonSummaryItem />
                            {/* Button placeholder */}
                            <div className="bg-muted h-7 w-7 shrink-0 rounded-full" />
                        </div>
                    ))}

                {status === "success" &&
                    (!noData ? (
                        displayData.map((item, i) => {
                            const meta = metaData?.[i];
                            const summaryKey = `${item.URI}-${meta?.ImageURL}`;
                            const delay = i * 20;

                            return (
                                <div
                                    key={item.URI}
                                    className={clsx(
                                        "border-border/60 hover:bg-accent/50 mx-4 flex flex-1 items-center justify-between px-4 py-2.5 transition duration-300 sm:mx-6 dark:border-white/[0.06]",
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
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                            <h2 className="text-muted-foreground text-2xl font-bold">
                                No summary data available
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Try adjusting your date range or filters.
                            </p>
                        </div>
                    ))}
            </div>

            <div className="border-border/60 w-full border-t py-4 dark:border-white/[0.06]">
                <SummaryPageButtons
                    summaryData={summaryData}
                    displayType={displayType}
                    offsetLimit={offsetLimit}
                    setFilters={setFilters}
                    isLoading={status === "pending"}
                    noData={noData}
                />
            </div>
        </div>
    );
};

export default SummaryBlock;

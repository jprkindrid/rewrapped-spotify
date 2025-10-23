import type {
    OffsetLimit,
    SummaryDisplay,
    SummaryEntry,
    SummaryFilters,
    SummmaryResponse,
} from "@/shared-components/SummaryTypes";
import type { Setter } from "@/utils/types";
import clsx from "clsx";
import ItemLinkButton from "./ItemLinkButton";
import SummaryItem from "./SummaryItem";
import SkeletonSummaryItem from "./SkeletonSummaryItem";
import SummaryPageButtons from "./SummaryPageButtons";

type SummaryBlockProps = {
    offsetLimit: OffsetLimit;
    setDisplayType: Setter<"artists" | "tracks">;
    setFilters: Setter<SummaryFilters>;
    displayType: SummaryDisplay;
    summaryData: SummmaryResponse | undefined;
    isLoading: boolean;
    error: Error | null;
};

const SummaryBlock = ({
    offsetLimit,
    setDisplayType,
    setFilters,
    displayType,
    summaryData,
    isLoading,
    error,
}: SummaryBlockProps) => {
    const displayData: SummaryEntry[] | undefined =
        displayType === "artists"
            ? summaryData?.top_artists
            : summaryData?.top_tracks;

    const offset: number =
        displayType === "artists"
            ? offsetLimit.offsetArtists
            : offsetLimit.offsetTracks;

    const limit: number = offsetLimit.limit;

    return (
        <div className="page-section relative flex flex-1 flex-col items-center overflow-clip rounded-lg">
            {error && (
                <div className="r-0 absolute top-0 flex h-full w-full flex-col items-center justify-center bg-stone-400/50 text-center text-2xl font-bold text-red-500 backdrop-blur-xs text-shadow-md dark:bg-stone-800/50">
                    <div>Error Getting Summary Data:</div>
                    <div className="text-sm">{error.message}</div>
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
                        onClick={() => {
                            setDisplayType("artists");
                        }}
                    >
                        ARTISTS
                    </button>
                    <button
                        className={clsx(
                            "bg-spotify-green rounded-r-md border-r border-black px-4 py-2 transition",
                            displayType !== "tracks" &&
                                "text-spotify-green bg-stone-800 hover:cursor-pointer"
                        )}
                        onClick={() => {
                            setDisplayType("tracks");
                        }}
                    >
                        TRACKS
                    </button>
                </div>
            </div>
            <div className="from-spotify-green/50 dark:to-spotify-black flex h-full w-full flex-col justify-between bg-gradient-to-bl to-white transition dark:from-stone-800">
                {isLoading ? (
                    <div className="py-2">
                        {Array.from({ length: limit }).map((_, i) => (
                            <SkeletonSummaryItem key={i} />
                        ))}
                    </div>
                ) : displayData ? (
                    (displayData ?? []).map((item, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "border-spotify-black/50 dark:border-spotify-green/50 mx-6 my-1 flex flex-1 items-center justify-between px-2",
                                i !== 0 && "border-t"
                            )}
                        >
                            <div className="flex flex-1 items-center gap-3">
                                <SummaryItem
                                    i={i}
                                    item={item}
                                    offset={offset}
                                    isLoading={false}
                                />
                            </div>
                            <div>
                                <ItemLinkButton link={item.SpotifyURL} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="dark:text-spotify-green text-spotify-black flex h-64 items-center justify-center font-bold text-shadow-sm dark:text-shadow-white/20">
                        No Data To Display For Current Selection
                    </div>
                )}
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

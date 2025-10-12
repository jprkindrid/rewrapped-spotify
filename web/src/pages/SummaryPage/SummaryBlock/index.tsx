import type { DateRange } from "react-day-picker";
import type {
    OffsetLimit,
    SummaryEntry,
    SummmaryResponse,
} from "../../../shared-components/SummaryTypes";
import type { Setter } from "../../../utils/types";
import clsx from "clsx";

type SummaryBlockProps = {
    setRange: Setter<DateRange>;
    setOffSetLimit: Setter<OffsetLimit>;
    offsetLimit: OffsetLimit;
    setDisplayType: Setter<"artists" | "tracks">;
    displayType: "artists" | "tracks";
    summaryData: SummmaryResponse | undefined;
    isLoading: boolean;
    error: Error | null;
};

const SummaryBlock = ({
    setRange,
    setOffSetLimit,
    offsetLimit,
    setDisplayType,
    displayType,
    summaryData,
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

    const placeHolderImgUrl =
        "https://i.scdn.co/image/ab67616d0000b273146c5a8b9da16e9072279041";
    return (
        <>
            <div className="border-spotify-black/50 relative my-2 flex flex-1 flex-col items-center overflow-clip rounded-lg border dark:border-white/50">
                {error && (
                    <div className="r-0 absolute top-0 flex h-full w-full items-center justify-center bg-stone-400/50 text-center text-2xl font-bold text-red-500 backdrop-blur-xs text-shadow-md dark:bg-stone-800/50">
                        Error Getting Summary Data
                    </div>
                )}
                <div className="bg-spotify-green dark:bg-spotify-black w-full px-5 py-4 dark:border-b dark:border-white/50">
                    <div className="text-spotify-black dark:text-spotify-green flex items-center font-bold">
                        <button
                            className="text-spotify-green dark:bg-spotify-green dark:text-spotify-black mr-2 rounded-md border border-black bg-black"
                            onClick={() => {
                                setDisplayType((prev) =>
                                    prev === "artists" ? "tracks" : "artists"
                                );
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="size-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                />
                            </svg>
                        </button>
                        {displayType.toLocaleUpperCase()}
                    </div>
                </div>
                <div className="from-spotify-green/40 dark:to-spotify-black flex h-full w-full flex-col justify-between bg-gradient-to-bl to-white dark:via-stone-600 dark:to-90%">
                    {displayData?.map((item: SummaryEntry, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "border-spotify-black/50 mx-2 my-1 flex flex-1 items-center justify-between px-4 dark:border-white/50",
                                i !== 0 && "border-t"
                            )}
                        >
                            <div className="flex items-center text-2xl text-shadow-sm">
                                <img
                                    src={placeHolderImgUrl} // TODO: REPLACE THIS
                                    className="mr-4 h-auto max-h-[80px] object-contain"
                                />
                                <div className="text-spotify-green mr-2 font-bold">
                                    {i + offset * offsetLimit.limit + 1}
                                    {"."}
                                </div>
                                <div>{item.Name}</div>
                            </div>
                            <div>yo</div>
                        </div>
                    ))}
                </div>
                <div></div>
            </div>
        </>
    );
};

export default SummaryBlock;

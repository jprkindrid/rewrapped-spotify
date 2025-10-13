import type {
    OffsetLimit,
    SummaryEntry,
    SummmaryResponse,
} from "@/shared-components/SummaryTypes";
import type { Setter } from "@/utils/types";
import clsx from "clsx";
import ItemLinkButton from "./ItemLinkButton";
import { formatMsDuration } from "@/utils/formatDuration";

type SummaryBlockProps = {
    offsetLimit: OffsetLimit;
    setDisplayType: Setter<"artists" | "tracks">;
    displayType: "artists" | "tracks";
    summaryData: SummmaryResponse | undefined;
    isLoading: boolean;
    error: Error | null;
};

const SummaryBlock = ({
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

    console.log(summaryData?.top_tracks[0]);
    console.log(summaryData?.top_artists[0]);

    return (
        <>
            <div className="border-spotify-black/50 relative my-2 flex flex-1 flex-col items-center overflow-clip rounded-lg border dark:border-white/50">
                {error && (
                    <div className="r-0 absolute top-0 flex h-full w-full items-center justify-center bg-stone-400/50 text-center text-2xl font-bold text-red-500 backdrop-blur-xs text-shadow-md dark:bg-stone-800/50">
                        Error Getting Summary Data
                    </div>
                )}
                <div className="bg-spotify-black flex w-full justify-center border-b border-white/50 px-5 py-2">
                    <div className="bg-spotify-green flex overflow-clip rounded-md font-bold">
                        <button
                            className={clsx(
                                "border-r border-black px-4 py-2",
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
                                "border-r border-black px-4 py-2",
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
                <div className="from-spotify-green/50 dark:to-spotify-black flex h-full w-full flex-col justify-between bg-gradient-to-bl to-white dark:from-stone-800">
                    {displayData?.map((item: SummaryEntry, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "border-spotify-black/50 dark:border-spotify-green/50 mx-6 my-1 flex flex-1 items-center justify-between px-2",
                                i !== 0 && "border-t"
                            )}
                        >
                            <div className="flex flex-1 items-center gap-3">
                                <div className="mt-2 flex w-full items-center text-2xl text-shadow-sm">
                                    <img
                                        src={placeHolderImgUrl} // TODO: REPLACE THIS
                                        className="mr-4 h-auto max-h-[80px] object-contain"
                                    />
                                    <div className="block flex-1 flex-col items-center sm:flex sm:flex-row">
                                        <div className="flex sm:w-1/2">
                                            <div className="text-spotify-green mr-2 flex font-bold">
                                                {i +
                                                    offset * offsetLimit.limit +
                                                    1}
                                                {"."}
                                            </div>
                                            <div>{item.Name}</div>
                                        </div>

                                        <div className="flex flex-1 text-base text-neutral-400 tabular-nums">
                                            <div className="mr-1">
                                                {item.Count} Plays -
                                            </div>
                                            <div>
                                                {formatMsDuration(item.TotalMs)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <ItemLinkButton link={placeHolderImgUrl} />
                            </div>
                        </div>
                    ))}
                </div>
                <div></div>
            </div>
        </>
    );
};

export default SummaryBlock;

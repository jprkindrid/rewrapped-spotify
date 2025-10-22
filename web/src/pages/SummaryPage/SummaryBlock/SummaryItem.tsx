import type { SummaryEntry } from "@/shared-components/SummaryTypes";
import { formatMsDuration } from "@/utils/formatDuration";

type Props = {
    i: number;
    item: SummaryEntry;
    offset: number;
    isLoading: boolean;
};

const SummaryItem = ({ i, item, offset, isLoading }: Props) => {
    const placeHolderImgUrl =
        "https://i.scdn.co/image/ab67616d0000b273146c5a8b9da16e9072279041";
    return (
        <div className="mt-2 flex w-full items-center text-xl text-shadow-sm sm:text-2xl">
            <div className="dark:ring-spotify-green/50 mr-4 h-[80px] w-[80px] flex-shrink-0 overflow-hidden shadow-lg dark:ring">
                {item.ArtworkURL != "" ? (
                    <img
                        src={item.ArtworkURL || placeHolderImgUrl}
                        alt={item.Name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="bg-spotify-green flex h-full w-full items-center text-center">
                        <div className="h-ful text-shadow-xl w-full text-base text-shadow-black">
                            No Artwork Found
                        </div>
                    </div>
                )}
            </div>
            <div className="block flex-1 flex-col items-center sm:flex sm:flex-row">
                <div className="flex sm:w-1/2">
                    <div className="text-spotify-green mr-2 flex font-bold">
                        {i + offset + 1}
                        {"."}
                        {/* <div className="text-xl text-red-500">{item.URI}</div> */}
                        <div> </div>
                    </div>
                    <div>{isLoading ? "Loading..." : item.Name}</div>
                </div>

                <div className="flex flex-1 flex-col text-sm text-neutral-400 tabular-nums sm:flex-row sm:text-base">
                    <div className="mr-1">{item.Count} Plays -</div>
                    <div>{formatMsDuration(item.TotalMs)}</div>
                </div>
            </div>
        </div>
    );
};

export default SummaryItem;

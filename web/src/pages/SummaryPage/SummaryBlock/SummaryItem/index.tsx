import type { SummaryDisplay, SummaryEntry } from "@/types/Summary";
import { formatMsDuration } from "@/utils/formatDuration";
import ArtworkBlock from "./ArtworkBlock";
import type { QueryStatus } from "@tanstack/react-query";

type Props = {
    i: number;
    item: SummaryEntry;
    offset: number;
    isLoading: boolean;
    displayType: SummaryDisplay;
    imageUrl: string;
    metaStatus: QueryStatus;
};

const SummaryItem = ({
    i,
    item,
    offset,
    isLoading,
    displayType,
    imageUrl,
    metaStatus,
}: Props) => {
    const placeHolderImgUrl =
        "https://i.scdn.co/image/ab67616d0000b273146c5a8b9da16e9072279041";

    const imageAlt =
        displayType == "artists"
            ? `Artwork for the artist '${item.Name}'`
            : `Album artwork for the track '${item.Name}'`;

    return (
        <div className="mt-2 flex w-full items-center text-xl text-shadow-sm sm:text-2xl">
            <div className="dark:ring-spotify-green/50 mr-4 h-20 w-20 shrink-0 overflow-hidden shadow-lg dark:ring">
                <ArtworkBlock
                    metaStatus={metaStatus}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    placeHolderImgUrl={placeHolderImgUrl}
                />
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

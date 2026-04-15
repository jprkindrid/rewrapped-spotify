import type { SummaryEntry } from "@/types/Summary";
import { formatMsDuration } from "@/utils/formatDuration";
import ArtworkBlock from "./ArtworkBlock";
import type { QueryStatus } from "@tanstack/react-query";
import type { EntityType } from "@/types/Shared";

type Props = {
    i: number;
    item: SummaryEntry;
    offset: number;
    isLoading: boolean;
    displayType: EntityType;
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

    const rank = i + offset + 1;

    return (
        <div className="flex w-full items-center gap-3">
            <div className="shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-border/60 dark:ring-white/[0.08]"
                style={{ width: 56, height: 56 }}
            >
                <ArtworkBlock
                    metaStatus={metaStatus}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    placeHolderImgUrl={placeHolderImgUrl}
                />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-0">
                <div className="flex items-baseline sm:w-1/2">
                    <span className="text-spotify-green mr-2 w-8 shrink-0 text-right text-base font-bold tabular-nums">
                        {rank}
                    </span>
                    <span className="text-base font-medium sm:text-lg">
                        {isLoading ? "Loading..." : item.Name}
                    </span>
                </div>

                <div className="flex flex-1 gap-1.5 pl-10 text-sm text-muted-foreground tabular-nums sm:pl-0">
                    <span>{item.Count} plays</span>
                    <span className="text-border">|</span>
                    <span>{formatMsDuration(item.TotalMs)}</span>
                </div>
            </div>
        </div>
    );
};

export default SummaryItem;

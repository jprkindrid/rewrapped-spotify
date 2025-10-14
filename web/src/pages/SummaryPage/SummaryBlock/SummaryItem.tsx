import type { SummaryEntry } from "@/shared-components/SummaryTypes";
import { formatMsDuration } from "@/utils/formatDuration";

type Props = {
    i: number;
    item: SummaryEntry;
    offset: number;
    limit: number;
    isLoading: boolean;
};

const SummaryItem = ({ i, item, offset, limit, isLoading }: Props) => {
    const placeHolderImgUrl =
        "https://i.scdn.co/image/ab67616d0000b273146c5a8b9da16e9072279041";
    return (
        <div className="mt-2 flex w-full items-center text-2xl text-shadow-sm">
            <img
                src={placeHolderImgUrl} // TODO: REPLACE THIS
                className="mr-4 h-auto max-h-[80px] object-contain"
            />
            <div className="block flex-1 flex-col items-center sm:flex sm:flex-row">
                <div className="flex sm:w-1/2">
                    <div className="text-spotify-green mr-2 flex font-bold">
                        {i + offset * limit + 1}
                        {"."}
                    </div>
                    <div>{isLoading ? "Loading..." : item.Name}</div>
                </div>

                <div className="flex flex-1 text-base text-neutral-400 tabular-nums">
                    <div className="mr-1">{item.Count} Plays -</div>
                    <div>{formatMsDuration(item.TotalMs)}</div>
                </div>
            </div>
        </div>
    );
};

export default SummaryItem;

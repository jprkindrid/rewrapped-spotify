import type { DateRange } from "react-day-picker";
import type {
    OffsetLimit,
    SummaryEntry,
    SummmaryResponse,
} from "../../shared-components/SummaryTypes";
import type { Setter } from "../../utils/types";

type SummaryBlockProps = {
    setRange: Setter<DateRange>;
    setOffSetLimit: Setter<OffsetLimit>;
    displayType: "artists" | "tracks";
    summaryData: SummmaryResponse | undefined;
    isLoading: boolean;
    error: Error | null;
};

const SummaryBlock = ({
    setRange,
    setOffSetLimit,
    displayType,
    summaryData,
    error,
}: SummaryBlockProps) => {
    const displayData =
        displayType === "artists"
            ? summaryData?.top_artists
            : summaryData?.top_tracks;
    return (
        <>
            <div className="relative my-2 flex flex-1 justify-center overflow-clip rounded-lg border border-green-500">
                {error && (
                    <div className="r-0 absolute top-0 flex h-full w-full items-center justify-center bg-stone-400/50 text-center text-2xl font-bold text-red-500 text-shadow-md dark:bg-stone-800/50">
                        Error Getting Summary Data
                    </div>
                )}
                <div>{displayType}</div>
                <div>
                    {displayData?.map((item: SummaryEntry) => (
                        <div key={item.id}>
                            <div>{item.Name}</div>
                        </div>
                    ))}
                </div>
                <div></div>
            </div>
        </>
    );
};

export default SummaryBlock;

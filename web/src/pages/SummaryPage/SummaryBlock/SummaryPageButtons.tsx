import type {
    OffsetLimit,
    SummaryFilters,
    SummaryResponse,
} from "@/types/Summary";
import { Button } from "@/components/ui/button";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import type { EntityType } from "@/types/Shared";

type Props = {
    summaryData: SummaryResponse | undefined;
    displayType: EntityType;
    offsetLimit: OffsetLimit;
    setFilters: Dispatch<SetStateAction<SummaryFilters>>;
    isLoading?: boolean;
    noData: boolean;
};

const SummaryPageButtons = ({
    summaryData,
    displayType,
    offsetLimit,
    setFilters,
    isLoading = false,
    noData = true,
}: Props) => {
    const [pageCount, setPageCount] = useState(0);

    const getCurrentPage = (offset: number) =>
        Math.floor(offset / offsetLimit.limit) + 1;

    const adjustOffset = useCallback(
        (amount: number) => {
            setFilters((prev) => {
                const isArtists = displayType === "artists";
                const total = isArtists
                    ? (summaryData?.total_artists_count ?? 0)
                    : (summaryData?.total_tracks_count ?? 0);

                if (total === 0) return prev;

                const currentOffset = isArtists
                    ? prev.offsetLimit.offsetArtists
                    : prev.offsetLimit.offsetTracks;

                const lastValidOffset = Math.max(total - offsetLimit.limit, 0);

                const nextOffset = Math.min(
                    Math.max(currentOffset + amount, 0),
                    lastValidOffset
                );

                if (nextOffset < 0 || nextOffset > lastValidOffset) {
                    return prev;
                }

                return {
                    ...prev,
                    offsetLimit: {
                        ...prev.offsetLimit,
                        ...(isArtists
                            ? { offsetArtists: nextOffset }
                            : { offsetTracks: nextOffset }),
                    },
                };
            });
        },
        [displayType, summaryData, offsetLimit.limit, setFilters]
    );

    const currentOffset =
        displayType === "artists"
            ? offsetLimit.offsetArtists
            : offsetLimit.offsetTracks;

    const lastTotalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!summaryData) return;

        const currentTotal =
            displayType === "artists"
                ? summaryData.total_artists_count
                : summaryData.total_tracks_count;

        const getPageCount = (itemCount: number | undefined) => {
            if (!itemCount) return 0;
            return Math.ceil(itemCount / offsetLimit.limit);
        };

        if (lastTotalRef.current !== currentTotal) {
            lastTotalRef.current = currentTotal;
            setPageCount(getPageCount(currentTotal));
        }
    }, [lastTotalRef, summaryData, displayType, offsetLimit.limit]);

    return (
        <div className="flex w-full items-center justify-center px-4">
            <div className="flex flex-col-reverse items-center gap-2 sm:flex-row">
                {[-100, -10, -1].map((n) => (
                    <Button
                        key={n}
                        variant="outline"
                        size="sm"
                        onClick={() => adjustOffset(n * offsetLimit.limit)}
                        disabled={isLoading || noData}
                    >
                        {n < 0 ? n : `+${n}`}
                    </Button>
                ))}
            </div>

            <div className="w-32 px-8 text-center text-wrap sm:w-max">
                Page {getCurrentPage(currentOffset)} of {pageCount}
            </div>

            <div className="flex flex-col items-center gap-2 sm:flex-row">
                {[1, 10, 100].map((n) => (
                    <Button
                        key={n}
                        variant="outline"
                        size="sm"
                        onClick={() => adjustOffset(n * offsetLimit.limit)}
                        disabled={isLoading || noData}
                    >
                        +{n}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default SummaryPageButtons;

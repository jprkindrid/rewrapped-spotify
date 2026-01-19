import type { UseBumpQueryResult } from "@/hooks/useBumpQuery";
import type { BumpEntry } from "@/types/Bump";

type BumpChartProps = {
    bumpQuery: UseBumpQueryResult;
};

const BumpChart = ({ bumpQuery }: BumpChartProps) => {
    const { data: bumpData, status, error: bumpError } = bumpQuery;
    const topTracks: BumpEntry[] = bumpData?.top_tracks;
    const topArtists: BumpEntry[] = bumpData?.top_artists;

    // console.log(topTracks);
    // TODO: THIS COMPONENT LOL
    return (
        <div className="flex justify-center py-12">
            This is unfinished but will eventually be a bump chart of top
            artists/tracks in a range
        </div>
    );
};

export default BumpChart;

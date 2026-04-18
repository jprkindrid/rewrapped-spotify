import NavBar from "@/components/NavBar";
import FilterControls from "../../components/FilterControls";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import BumpChart from "./BumpChart";
import { useBumpQuery } from "@/hooks/useBumpQuery";
import { useListeningTimeQuery } from "@/hooks/useListeningTimeQuery";
import { useListeningClockQuery } from "@/hooks/useListeningClockQuery";
import { useDiscoveryQuery } from "@/hooks/useDiscoveryQuery";
import { useDiversityQuery } from "@/hooks/useDiversityQuery";
import { useStreaksQuery } from "@/hooks/useStreaksQuery";
import ListeningTimeChart from "./ChartBlock/ListeningTimeChart";
import ListeningClockChart from "./ChartBlock/ListeningClockChart";
import DiscoveryChart from "./ChartBlock/DiscoveryChart";
import DiversityChart from "./ChartBlock/DiversityChart";
import StreaksChart from "./ChartBlock/StreaksChart";
import { useChartsFilterParams } from "@/hooks/useFilterParams";

export const ChartsPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const {
        filters,
        bufferFilters,
        setBufferFilters,
        handleApply,
        handleReset,
        demo,
    } = useChartsFilterParams();

    if (!token && !demo) {
        navigate({ to: "/" });
    }

    const bumpQuery = useBumpQuery(
        filters.range,
        filters.sortBy,
        filters.interval,
        token!,
        demo,
        filters.interval !== "daily"
    );

    const listeningTimeQuery = useListeningTimeQuery(
        filters.range,
        filters.interval,
        token!,
        demo
    );

    const listeningClockQuery = useListeningClockQuery(
        filters.range,
        token!,
        demo
    );

    const discoveryQuery = useDiscoveryQuery(
        filters.range,
        filters.sortBy,
        token!,
        demo
    );

    const diversityQuery = useDiversityQuery(
        filters.range,
        filters.interval,
        token!,
        demo
    );

    const streaksQuery = useStreaksQuery(filters.range, token!, demo);

    return (
        <div className="flex w-full flex-col">
            <NavBar includeUser={!demo} />
            <div className="bg-background flex min-h-screen flex-col items-center py-8 font-sans transition">
                <div className="relative h-full w-full max-w-5xl">
                    <section className="page-section mx-3 mb-6 rounded-xl">
                        <FilterControls
                            bufferFilters={bufferFilters}
                            setBufferFilters={setBufferFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                        />
                    </section>
                    {demo && (
                        <div className="flex w-full justify-center text-center">
                            <div className="text-spotify-green border-spotify-green/20 bg-spotify-green/5 mb-6 w-fit rounded-lg border px-6 py-3 text-sm font-semibold">
                                Demo Data Courtesy of{" "}
                                <a
                                    className="hover:text-foreground underline transition-colors"
                                    href="https://www.kindridmusic.com/"
                                    target="_blank"
                                >
                                    Kindrid
                                </a>
                            </div>
                        </div>
                    )}
                    <section className="page-section mx-3 flex flex-col overflow-hidden rounded-xl">
                        <BumpChart bumpQuery={bumpQuery} filters={filters} />
                    </section>
                    <section className="page-section mx-3 mt-6 flex flex-col overflow-hidden rounded-xl">
                        <ListeningTimeChart
                            listeningTimeQuery={listeningTimeQuery}
                            filters={filters}
                        />
                    </section>
                    <section className="page-section mx-3 mt-6 flex flex-col overflow-hidden rounded-xl">
                        <ListeningClockChart
                            listeningClockQuery={listeningClockQuery}
                        />
                    </section>
                    <section className="page-section mx-3 mt-6 flex flex-col overflow-hidden rounded-xl">
                        <DiversityChart
                            diversityQuery={diversityQuery}
                            filters={filters}
                        />
                    </section>
                    <section className="page-section mx-3 mt-6 flex flex-col overflow-hidden rounded-xl">
                        <DiscoveryChart
                            discoveryQuery={discoveryQuery}
                            token={token!}
                            demo={demo}
                        />
                    </section>
                    <section className="page-section mx-3 mt-6 mb-6 flex flex-col overflow-hidden rounded-xl">
                        <StreaksChart streaksQuery={streaksQuery} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ChartsPage;

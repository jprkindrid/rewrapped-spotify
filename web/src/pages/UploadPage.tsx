import { useQuery } from "@tanstack/react-query";
import Explanation from "@/shared-components/Explanation";
import NavBar from "@/shared-components/NavBar";
import * as userService from "@/services/user";
import type { UserIdData } from "@/shared-components/UserIdData";

const UploadPage = () => {
    const { data: userIdData } = useQuery<UserIdData>({
        queryKey: ["userIDs"],
        queryFn: userService.fetchUserIDs,
        retry: false,
        staleTime: 60_000,
    });

    return (
        <>
            <NavBar userIdData={userIdData} includeUser={true} />
            <div className="dark:bg-spotify-black text-spotify-black flex w-screen justify-center pt-8 transition dark:text-white">
                <div className="mx-4 h-screen w-full max-w-5xl">
                    <section className="flex flex-col items-center rounded-xl border-2 border-stone-500/10 text-center shadow-md dark:border-white/20">
                        <h2 className="pt-4 text-3xl font-bold">
                            Upload Your Streaming History
                        </h2>
                        <div className="bg-spotify-green my-4 h-px w-[calc(100%-4rem)]"></div>
                        <div className="mb-2 max-w-2xl text-stone-500 dark:text-slate-300">
                            Upload your streaming history JSON files, or entire
                            .zip file to get started! Choose your files and then
                            analyze the data!
                        </div>
                        <div className="py-2">
                            <div className="mb-4">
                                <button className="bg-spotify-green dark:text-spotify-black mx-2 rounded-full px-4 py-2 text-stone-100 hover:bg-green-700">
                                    Choose Files
                                </button>
                                <button className="bg-spotify-green dark:text-spotify-black mx-2 rounded-full px-4 py-2 text-stone-100 hover:bg-green-700">
                                    Analyze Data
                                </button>
                            </div>

                            <div className="my-2 text-slate-700 text-shadow-xs dark:text-slate-400 dark:text-shadow-white">
                                File Selected: DarudeSandstorm.json
                            </div>
                        </div>
                    </section>
                    <Explanation />
                </div>
            </div>
        </>
    );
};
export default UploadPage;

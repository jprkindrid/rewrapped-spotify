import { useQuery } from "@tanstack/react-query";
import Explanation from "@/shared-components/Explanation";
import NavBar from "@/shared-components/NavBar";
import * as userService from "@/services/user";
import type { UserIdData } from "@/shared-components/UserIdData";
import FileUploadSection from "./FileUploadSection";

const UploadPage = () => {
    const { data: userIdData } = useQuery<UserIdData>({
        queryKey: ["userIDs"],
        queryFn: userService.fetchUserIDs,
        retry: false,
        staleTime: 60_000,
    });

    return (
        <div className="flex flex-col">
            <NavBar userIdData={userIdData} includeUser={true} />
            <div className="dark:bg-spotify-black text-spotify-black flex w-full justify-center pt-4 transition dark:text-white">
                <div className="mx-2 h-screen w-full max-w-5xl">
                    <section className="flex flex-col items-center rounded-xl border-2 border-stone-500/10 text-center shadow-md dark:border-white/20">
                        <h2 className="pt-4 text-3xl font-bold">
                            Upload Your Streaming History
                        </h2>
                        <div className="bg-spotify-green my-4 h-px w-[calc(100%-4rem)]"></div>
                        <div className="mb-2 max-w-2xl text-stone-500 dark:text-stone-300">
                            Upload your streaming history JSON files, or entire
                            .zip file to get started! Choose your files and then
                            analyze the data!
                        </div>
                        <FileUploadSection />
                    </section>
                    <Explanation />
                </div>
            </div>
        </div>
    );
};
export default UploadPage;

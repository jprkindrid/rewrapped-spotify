import { useQuery } from "@tanstack/react-query";
import { fetchUserIDs } from "../../services/user";
import NavBar from "../../shared-components/NavBar";
import type { UserIdData } from "../../shared-components/UserIdData";

export const SummaryPage = () => {
  const { data: userIdData } = useQuery<UserIdData>({
    queryKey: ["userIDs"],
    queryFn: fetchUserIDs,
    retry: false,
    staleTime: 60_000,
  });
  return (
    <>
      <NavBar userIdData={userIdData} includeUser={true} />
      <div className="dark:bg-spotify-black text-spotify-black flex h-screen justify-center bg-white font-sans transition dark:text-white">
        <div className="w-full max-w-5xl">
          AND HERE THERE WILL BE COOL THING YES
        </div>
      </div>
    </>
  );
};

export default SummaryPage;

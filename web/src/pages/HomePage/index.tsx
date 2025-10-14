import Explanation from "@/shared-components/Explanation";
import NavBar from "@/shared-components/NavBar";
import { API_URL } from "@/utils/constants";

const HomePage = () => {
    return (
        <>
            <NavBar userIdData={undefined} includeUser={false} />
            <div className="dark:bg-spotify-black text-spotify-black flex w-full justify-center pt-8 transition dark:text-white">
                <div className="mx-2 h-screen w-full max-w-5xl">
                    <div className="mt-4 mb-8 flex flex-col items-center rounded-xl">
                        <button
                            className="bg-spotify-green text-spotify-black flex items-center justify-center rounded-full p-4 text-2xl shadow-sm transition hover:scale-105 hover:cursor-pointer dark:text-white dark:shadow-white"
                            onClick={() => {
                                window.location.href = `${API_URL}/auth/spotify/login`;
                            }}
                        >
                            <div className="mr-4">
                                <svg
                                    fill="currentcolor"
                                    role="img"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="size-16"
                                >
                                    <title>Spotify</title>
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                            </div>
                            Log In With Spotify
                        </button>
                    </div>
                    <Explanation />
                </div>
            </div>
        </>
    );
};

export default HomePage;

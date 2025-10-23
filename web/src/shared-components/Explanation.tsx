const Explanation = () => {
    return (
        <section className="page-section mt-4 flex flex-col items-center rounded-xl py-4">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <div className="bg-spotify-green my-4 h-px w-[calc(100%-4rem)]"></div>

            <ol className="max-w-[80%] list-decimal text-stone-500 dark:text-stone-300">
                <li>
                    Go to{" "}
                    <a
                        href="https://www.spotify.com/account/privacy/"
                        target="_blank"
                        className="hover:text-spotify-green underline"
                    >
                        Spotify Privacy Settings
                    </a>
                </li>
                <li>
                    Under "Account privacy" request your "Extended Streaming
                    History"
                </li>
                <li>Login with your Spotify account</li>
                <li>
                    Once you have your data, upload your streaming history files
                </li>
                <li>Explore your personalized insights</li>
            </ol>
        </section>
    );
};

export default Explanation;

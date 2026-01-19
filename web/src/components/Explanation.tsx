const Explanation = () => {
    return (
        <section className="page-section mt-8 flex flex-col items-center rounded-lg py-6 shadow-sm">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <div className="from-spotify-green/0 via-spotify-green to-spotify-green/0 my-6 h-1 w-[calc(100%-4rem)] rounded-full bg-linear-to-r"></div>

            <ol className="max-w-[80%] list-decimal space-y-2 text-neutral-600 dark:text-neutral-300">
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

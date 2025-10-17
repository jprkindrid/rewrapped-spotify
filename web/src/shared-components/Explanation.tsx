const Explanation = () => {
    return (
        <section className="mt-4 flex flex-col items-center rounded-xl border-2 border-slate-500/10 py-4 shadow-md dark:border-white/20">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <div className="bg-spotify-green my-4 h-px w-[calc(100%-4rem)]"></div>

            <ol className="max-w-[80%] list-decimal">
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

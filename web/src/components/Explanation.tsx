const Explanation = () => {
    return (
        <section className="page-section mt-8 flex flex-col items-center rounded-xl py-6">
            <h2 className="text-xl font-bold">How It Works</h2>
            <div className="my-4 h-px w-[calc(100%-4rem)] max-w-md bg-border/60" />

            <ol className="max-w-[80%] list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                    Go to{" "}
                    <a
                        href="https://www.spotify.com/account/privacy/"
                        target="_blank"
                        className="text-spotify-green font-medium hover:underline"
                    >
                        Spotify Privacy Settings
                    </a>
                </li>
                <li>
                    Under &quot;Account privacy&quot; request your
                    &quot;Extended Streaming History&quot;
                </li>
                <li>Create an account or log in</li>
                <li>
                    Once you have your data, upload your streaming history files
                </li>
                <li>Explore your personalized insights</li>
            </ol>
        </section>
    );
};

export default Explanation;

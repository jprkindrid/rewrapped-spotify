const SkeletonSummaryItem = () => {
    return (
        <div className="mt-2 flex w-full animate-pulse items-center text-xl sm:text-2xl">
            <div className="mx-6 flex w-full items-center px-4 py-2">
                <div className="dark:ring-spotify-green/50 mr-4 h-20 w-20 shrink-0 overflow-hidden rounded shadow-lg dark:ring"></div>

                <div className="block flex-1 flex-col items-center sm:flex sm:flex-row">
                    <div className="flex sm:w-1/2">
                        <div className="mr-2 flex font-bold">
                            <div className="h-6 w-8 rounded bg-neutral-300 dark:bg-neutral-700"></div>
                        </div>
                        <div className="h-6 w-2/3 rounded bg-neutral-300 dark:bg-neutral-700"></div>
                    </div>

                    <div className="flex flex-1 flex-col text-sm tabular-nums sm:flex-row sm:text-base">
                        <div className="mr-1 h-4 w-1/3 rounded bg-neutral-300 dark:bg-neutral-700"></div>
                        <div className="h-4 w-1/4 rounded bg-neutral-300 dark:bg-neutral-700"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonSummaryItem;

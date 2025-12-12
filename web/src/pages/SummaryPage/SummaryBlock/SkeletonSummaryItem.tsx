const SkeletonSummaryItem = () => {
    return (
        <div className="flex w-full animate-pulse items-center px-6 py-2">
            <div className="mr-4 h-20 w-20 rounded bg-stone-300 dark:bg-stone-700"></div>

            <div className="flex w-full flex-1 items-center justify-between sm:flex-row">
                <div className="flex flex-1 flex-col sm:flex-row">
                    <div className="flex items-center gap-2 sm:w-1/2">
                        <div className="h-6 w-6 rounded bg-stone-300 dark:bg-stone-700"></div>
                        <div className="h-6 w-2/3 rounded bg-stone-300 dark:bg-stone-700"></div>
                    </div>

                    <div className="mt-1 flex flex-1 gap-1 text-base sm:mt-0 sm:flex-row">
                        <div className="h-4 w-1/3 rounded bg-stone-300 dark:bg-stone-700"></div>
                        <div className="h-4 w-1/4 rounded bg-stone-300 dark:bg-stone-700"></div>
                    </div>
                </div>

                <div className="h-12 w-12 rounded-full bg-stone-300 px-4 dark:bg-stone-700"></div>
            </div>
        </div>
    );
};

export default SkeletonSummaryItem;

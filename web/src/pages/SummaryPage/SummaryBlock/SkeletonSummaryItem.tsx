const SkeletonSummaryItem = () => {
    return (
        <div className="flex flex-1 animate-pulse items-center">
            <div className="flex w-full items-center">
                {/* Artwork Placeholder */}
                <div className="mr-4 h-20 w-20 shrink-0 bg-neutral-900/10 dark:bg-neutral-100/10 dark:ring dark:ring-neutral-200/30" />

                <div className="block flex-1 flex-col items-center sm:flex sm:flex-row">
                    <div className="flex items-center sm:w-1/2">
                        {/* Rank Number */}
                        <div className="mr-2 h-6 w-8 rounded bg-neutral-900/20 dark:bg-neutral-100/20" />
                        {/* Name */}
                        <div className="h-7 w-2/3 rounded bg-neutral-900/15 dark:bg-neutral-100/15" />
                    </div>

                    <div className="mt-2 flex flex-1 flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center">
                        {/* Stats - lower opacity to match the "secondary" text feel */}
                        <div className="h-4 w-20 rounded bg-neutral-900/5 dark:bg-neutral-100/5" />
                        <div className="h-4 w-24 rounded bg-neutral-900/5 dark:bg-neutral-100/5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonSummaryItem;

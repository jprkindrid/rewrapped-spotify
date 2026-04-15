const SkeletonSummaryItem = () => {
    return (
        <div className="flex flex-1 animate-pulse items-center">
            <div className="flex w-full items-center gap-3">
                {/* Artwork Placeholder */}
                <div className="h-14 w-14 shrink-0 rounded-md bg-muted" />

                <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-0">
                    <div className="flex items-center sm:w-1/2">
                        {/* Rank Number */}
                        <div className="mr-2 h-5 w-8 rounded bg-muted" />
                        {/* Name */}
                        <div className="h-5 w-2/3 rounded bg-muted/80" />
                    </div>

                    <div className="mt-1 flex flex-1 gap-1.5 pl-10 sm:mt-0 sm:pl-0">
                        {/* Stats */}
                        <div className="h-4 w-16 rounded bg-muted/60" />
                        <div className="h-4 w-20 rounded bg-muted/60" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonSummaryItem;

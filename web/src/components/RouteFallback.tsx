type RouteFallbackProps = {
    message: string;
};

const RouteFallback = ({ message }: RouteFallbackProps) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
            <div className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">
                {message}
            </div>
        </div>
    );
};

export default RouteFallback;

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

const LoadingState = () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-stone-900">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-9 animate-pulse text-stone-500"
            aria-label="loading"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
           1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0
           0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0
           2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
            />
        </svg>
    </div>
);

const ErrorState = () => (
    <div className="bg-spotify-green flex h-full w-full items-center justify-center">
        <span className="text-base font-semibold text-white">Error</span>
    </div>
);

const EmptyState = () => (
    <div className="bg-spotify-green flex h-full w-full items-center justify-center text-center">
        <span className="text-shadow-xl text-base text-shadow-black">
            No Artwork Found
        </span>
    </div>
);

interface ImageStateProps {
    imageUrl: string;
    imageAlt: string;
    placeHolderImgUrl: string;
    setHasLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageState = ({
    imageUrl,
    imageAlt,
    placeHolderImgUrl,
    setHasLoaded,
}: ImageStateProps) => (
    <img
        src={imageUrl}
        alt={imageAlt}
        className="h-full w-full object-cover"
        loading="lazy"
        onLoad={() => setHasLoaded(true)}
        onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src = placeHolderImgUrl)
        }
    />
);

interface ArtworkBlockProps {
    metaIsLoading: boolean;
    metaError: boolean;
    imageUrl?: string;
    imageAlt: string;
    placeHolderImgUrl: string;
}

export const ArtworkBlock = ({
    metaIsLoading,
    metaError,
    imageUrl,
    imageAlt,
    placeHolderImgUrl,
}: ArtworkBlockProps) => {
    const [visible, setVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false); // for state after image loads
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Decide what to render
    let content;
    if (metaIsLoading) content = <LoadingState />;
    else if (metaError) content = <ErrorState />;
    else if (imageUrl && imageUrl !== "")
        content = (
            <ImageState
                imageUrl={imageUrl}
                imageAlt={imageAlt}
                placeHolderImgUrl={placeHolderImgUrl}
                setHasLoaded={setHasLoaded}
            />
        );
    else content = <EmptyState />;

    return (
        <div
            ref={ref}
            // 👇 Transition styles here
            data-loaded={hasLoaded}
            className={clsx(
                "dark:ring-spotify-green/50 mr-4 h-[80px] w-[80px] flex-shrink-0 overflow-hidden shadow-lg transition-opacity duration-200 dark:ring",
                hasLoaded ? "opacity-100" : "opacity-0"
            )}
        >
            {visible && content}
        </div>
    );
};

export default ArtworkBlock;

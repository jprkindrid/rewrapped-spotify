import clsx from "clsx";

const SOURCE_URL = "https://github.com/jprkindrid/rewrapped-spotify";

type SourceLinkProps = {
    variant?: "icon" | "text";
    className?: string;
};

// lucide-react no longer ships brand icons, so the GitHub mark is inlined.
const GitHubMark = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden
    >
        <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
);

const SourceLink = ({ variant = "icon", className }: SourceLinkProps) => {
    if (variant === "text") {
        return (
            <a
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                    "text-muted-foreground hover:text-foreground focus-visible:ring-spotify-green inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    className
                )}
            >
                <GitHubMark className="size-4" />
                View source on GitHub
            </a>
        );
    }

    return (
        <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            title="View source on GitHub"
            className={clsx(
                "text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-spotify-green rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none",
                className
            )}
        >
            <GitHubMark className="size-4" />
        </a>
    );
};

export default SourceLink;

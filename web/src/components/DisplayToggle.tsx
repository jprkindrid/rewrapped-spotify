import { Button } from "@/components/ui/button";
import clsx from "clsx";

type DisplayType = "artists" | "tracks";

type DisplayToggleProps = {
    displayType: DisplayType;
    onDisplayTypeChange: (type: DisplayType) => void;
    noData: boolean;
};

const DisplayToggle = ({
    displayType,
    onDisplayTypeChange,
    noData = true,
}: DisplayToggleProps) => {
    return (
        <div className="flex w-full justify-center border-b border-border/60 bg-muted/50 px-5 py-3 dark:border-white/[0.06]">
            <div className="inline-flex rounded-lg bg-muted p-0.5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDisplayTypeChange("artists")}
                    className={clsx(
                        "rounded-md px-4 text-xs font-semibold tracking-wide uppercase transition-all",
                        displayType === "artists"
                            ? "bg-spotify-green text-black shadow-sm hover:bg-spotify-green/90"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    disabled={noData}
                >
                    Artists
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDisplayTypeChange("tracks")}
                    className={clsx(
                        "rounded-md px-4 text-xs font-semibold tracking-wide uppercase transition-all",
                        displayType === "tracks"
                            ? "bg-spotify-green text-black shadow-sm hover:bg-spotify-green/90"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    disabled={noData}
                >
                    Tracks
                </Button>
            </div>
        </div>
    );
};

export default DisplayToggle;

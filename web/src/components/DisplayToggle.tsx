import { Button } from "@/components/ui/button";
import clsx from "clsx";
import type { ReactNode } from "react";

type DisplayType = "artists" | "tracks";

type DisplayToggleProps = {
    displayType: DisplayType;
    onDisplayTypeChange: (type: DisplayType) => void;
    noData: boolean;
    searchSlot?: ReactNode;
};

const DisplayToggle = ({
    displayType,
    onDisplayTypeChange,
    noData = true,
    searchSlot,
}: DisplayToggleProps) => {
    return (
        <div className="border-border/60 bg-muted/50 flex w-full items-center justify-between border-b px-5 py-3 dark:border-white/[0.06]">
            <div className="w-20 shrink-0" />
            <div className="bg-muted inline-flex rounded-lg p-0.5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDisplayTypeChange("artists")}
                    className={clsx(
                        "rounded-md px-4 text-xs font-semibold tracking-wide uppercase transition-all",
                        displayType === "artists"
                            ? "bg-spotify-green hover:bg-spotify-green/90 text-black shadow-sm"
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
                            ? "bg-spotify-green hover:bg-spotify-green/90 text-black shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    disabled={noData}
                >
                    Tracks
                </Button>
            </div>
            <div className="flex w-20 shrink-0 justify-end">{searchSlot}</div>
        </div>
    );
};

export default DisplayToggle;

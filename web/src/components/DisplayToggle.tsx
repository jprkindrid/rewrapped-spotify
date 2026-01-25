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
        <div className="bg-spotify-black border-spotify-green/30 flex w-full justify-around overflow-clip rounded-t-lg border-b px-5 py-3">
            <div className="flex">
                <Button
                    variant={displayType === "artists" ? "default" : "outline"}
                    onClick={() => onDisplayTypeChange("artists")}
                    className={clsx(
                        "rounded-r-none",
                        displayType === "artists"
                            ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                            : "border-spotify-green text-spotify-green"
                    )}
                    disabled={noData}
                >
                    ARTISTS
                </Button>
                <Button
                    variant={displayType === "tracks" ? "default" : "outline"}
                    onClick={() => onDisplayTypeChange("tracks")}
                    className={clsx(
                        "rounded-l-none border-l-0",
                        displayType === "tracks"
                            ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                            : "border-spotify-green text-spotify-green"
                    )}
                    disabled={noData}
                >
                    TRACKS
                </Button>
            </div>
        </div>
    );
};

export default DisplayToggle;

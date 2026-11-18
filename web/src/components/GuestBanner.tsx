import { useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SaveDataDialog from "@/components/SaveDataDialog";

const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
});

/** Tells guests when their data expires and offers to save it. */
const GuestBanner = () => {
    const { isGuest, expiresAt } = useAuth();
    const [showSave, setShowSave] = useState(false);

    if (!isGuest) return null;

    return (
        <>
            <div className="border-spotify-green/20 bg-spotify-green/5 mx-3 mb-6 flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-sm sm:flex-row sm:gap-4">
                <span className="text-muted-foreground inline-flex items-center gap-2">
                    <Clock
                        className="text-spotify-green size-4 shrink-0"
                        aria-hidden
                    />
                    <span>
                        You&apos;re using ReWrapped as a guest.
                        {expiresAt && (
                            <>
                                {" "}
                                Your data will be deleted on{" "}
                                <span className="text-foreground font-medium">
                                    {dateFormat.format(expiresAt)}
                                </span>
                                .
                            </>
                        )}
                    </span>
                </span>
                <button
                    type="button"
                    onClick={() => setShowSave(true)}
                    className="bg-spotify-green focus-visible:ring-spotify-green shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-black transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    Save my data
                </button>
            </div>
            <SaveDataDialog open={showSave} onOpenChange={setShowSave} />
        </>
    );
};

export default GuestBanner;

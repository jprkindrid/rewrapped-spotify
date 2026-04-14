import { useState, useCallback, useRef, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDiscoverySearchQuery } from "@/hooks/useDiscoverySearchQuery";
import { useDiscoverySearchImages } from "@/hooks/useDiscoverySearchImages";
import { useDarkMode } from "@/hooks/useDarkMode";
import { formatTime } from "@/utils/formatTime";
import type { DiscoverySearchEntry } from "@/types/Charts";
import { Search, ArrowLeft, Loader2, Music } from "lucide-react";

type ArtistSearchPopoverProps = {
    range: DateRange | undefined;
    token: string;
    demo: boolean;
};

const PLACEHOLDER_IMG =
    "https://i.scdn.co/image/ab67616d0000b273146c5a8b9da16e9072279041";

const ArtistSearchPopover = ({
    range,
    token,
    demo,
}: ArtistSearchPopoverProps) => {
    const isDark = useDarkMode();
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedArtist, setSelectedArtist] =
        useState<DiscoverySearchEntry | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const searchQuery = useDiscoverySearchQuery(
        range,
        debouncedQuery,
        token,
        demo
    );

    const imageQuery = useDiscoverySearchImages(
        searchQuery.data?.artists,
        token,
        demo
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);
            setSelectedArtist(null);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                setDebouncedQuery(value.trim());
            }, 300);
        },
        []
    );

    const handleSelectArtist = useCallback(
        (artist: DiscoverySearchEntry, index: number) => {
            setSelectedArtist(artist);
            const imageUrl = imageQuery.data?.[index]?.ImageURL ?? "";
            setSelectedImageUrl(imageUrl);
        },
        [imageQuery.data]
    );

    const handleBack = useCallback(() => {
        setSelectedArtist(null);
        setSelectedImageUrl("");
    }, []);

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setInputValue("");
            setDebouncedQuery("");
            setSelectedArtist(null);
            setSelectedImageUrl("");
        }
    }, []);

    // Focus input when popover opens
    useEffect(() => {
        if (open) {
            // Small delay for portal mount
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const artists = searchQuery.data?.artists ?? [];
    const isSearching =
        searchQuery.isFetching || (debouncedQuery !== inputValue.trim() && inputValue.trim().length >= 2);
    const hasResults = artists.length > 0;
    const showNoResults =
        debouncedQuery.length >= 2 &&
        !searchQuery.isFetching &&
        searchQuery.isSuccess &&
        !hasResults;

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isDark
                            ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                    aria-label="Search artists"
                >
                    <Search className="size-3.5" />
                    <span>Search</span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={`w-80 p-0 ${
                    isDark
                        ? "border-neutral-700 bg-neutral-900"
                        : "border-neutral-200 bg-white"
                }`}
                align="end"
                sideOffset={8}
            >
                {selectedArtist ? (
                    <ArtistDetail
                        artist={selectedArtist}
                        imageUrl={selectedImageUrl}
                        isDark={isDark}
                        onBack={handleBack}
                    />
                ) : (
                    <>
                        {/* Search input */}
                        <div
                            className={`flex items-center gap-2 border-b px-3 py-2.5 ${
                                isDark
                                    ? "border-neutral-700"
                                    : "border-neutral-200"
                            }`}
                        >
                            <Search
                                className={`size-4 flex-shrink-0 ${
                                    isDark
                                        ? "text-neutral-500"
                                        : "text-neutral-400"
                                }`}
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Search any artist..."
                                className={`w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 ${
                                    isDark
                                        ? "text-neutral-100"
                                        : "text-neutral-900"
                                }`}
                            />
                            {isSearching && (
                                <Loader2 className="size-4 flex-shrink-0 animate-spin text-neutral-400" />
                            )}
                        </div>

                        {/* Results */}
                        <div className="max-h-64 overflow-y-auto">
                            {hasResults &&
                                artists.map((artist, i) => (
                                    <ArtistRow
                                        key={artist.name}
                                        artist={artist}
                                        imageUrl={
                                            imageQuery.data?.[i]?.ImageURL ?? ""
                                        }
                                        imageLoading={imageQuery.isFetching}
                                        isDark={isDark}
                                        onSelect={() =>
                                            handleSelectArtist(artist, i)
                                        }
                                    />
                                ))}

                            {showNoResults && (
                                <div className="px-3 py-6 text-center text-sm text-neutral-500">
                                    No artists found for &ldquo;
                                    {debouncedQuery}&rdquo;
                                </div>
                            )}

                            {debouncedQuery.length < 2 &&
                                inputValue.length > 0 && (
                                    <div className="px-3 py-6 text-center text-sm text-neutral-500">
                                        Type at least 2 characters to search
                                    </div>
                                )}

                            {inputValue.length === 0 && (
                                <div className="px-3 py-6 text-center text-sm text-neutral-500">
                                    Search your entire listening history
                                </div>
                            )}
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
};

/* ── Row in search results ── */

type ArtistRowProps = {
    artist: DiscoverySearchEntry;
    imageUrl: string;
    imageLoading: boolean;
    isDark: boolean;
    onSelect: () => void;
};

const ArtistRow = ({
    artist,
    imageUrl,
    imageLoading,
    isDark,
    onSelect,
}: ArtistRowProps) => {
    const [imgError, setImgError] = useState(false);
    const showImage = imageUrl && !imgError;

    return (
        <button
            onClick={onSelect}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-50"
            }`}
        >
            <div
                className={`flex size-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ${
                    isDark ? "bg-neutral-800" : "bg-neutral-100"
                }`}
            >
                {imageLoading ? (
                    <div className="size-full animate-pulse rounded-full bg-neutral-700" />
                ) : showImage ? (
                    <img
                        src={imageUrl}
                        alt={artist.name}
                        className="size-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <Music
                        className={`size-4 ${
                            isDark ? "text-neutral-600" : "text-neutral-400"
                        }`}
                    />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div
                    className={`truncate text-sm font-medium ${
                        isDark ? "text-neutral-100" : "text-neutral-900"
                    }`}
                >
                    {artist.name}
                </div>
                <div className="text-xs text-neutral-500">
                    {artist.count} {artist.count === 1 ? "play" : "plays"}
                </div>
            </div>
        </button>
    );
};

/* ── Detail card for selected artist ── */

type ArtistDetailProps = {
    artist: DiscoverySearchEntry;
    imageUrl: string;
    isDark: boolean;
    onBack: () => void;
};

const ArtistDetail = ({
    artist,
    imageUrl,
    isDark,
    onBack,
}: ArtistDetailProps) => {
    const [imgError, setImgError] = useState(false);
    const displayImage =
        imageUrl && !imgError ? imageUrl : PLACEHOLDER_IMG;

    const date = new Date(artist.firstListen + "T00:00:00");
    const fullDateLabel = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="p-3">
            {/* Back button */}
            <button
                onClick={onBack}
                className={`mb-3 flex items-center gap-1 text-xs font-medium transition-colors ${
                    isDark
                        ? "text-neutral-400 hover:text-neutral-200"
                        : "text-neutral-500 hover:text-neutral-700"
                }`}
                aria-label="Back to search results"
            >
                <ArrowLeft className="size-3.5" />
                <span>Back to results</span>
            </button>

            {/* Artist card */}
            <div className="flex items-start gap-3">
                <div className="flex size-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src={displayImage}
                        alt={artist.name}
                        className="size-full object-cover"
                        onError={() => setImgError(true)}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h3
                        className={`truncate text-base font-bold ${
                            isDark ? "text-neutral-100" : "text-neutral-900"
                        }`}
                    >
                        {artist.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        First discovered {fullDateLabel}
                    </p>
                    <div className="mt-2 flex gap-3">
                        <Stat
                            label="Plays"
                            value={artist.count.toLocaleString()}
                            isDark={isDark}
                        />
                        <Stat
                            label="Time"
                            value={formatTime(artist.totalMs)}
                            isDark={isDark}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Small stat pill ── */

type StatProps = {
    label: string;
    value: string;
    isDark: boolean;
};

const Stat = ({ label, value, isDark }: StatProps) => (
    <div
        className={`rounded px-2 py-1 text-center ${
            isDark ? "bg-neutral-800" : "bg-neutral-100"
        }`}
    >
        <div
            className={`text-sm font-semibold ${
                isDark ? "text-neutral-100" : "text-neutral-900"
            }`}
        >
            {value}
        </div>
        <div className="text-[10px] text-neutral-500">{label}</div>
    </div>
);

export default ArtistSearchPopover;

import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import DarkModeButtons from "./DarkModeButtons";
import UserModal from "./modals/UserModal";
import SettingsPanel from "./modals/SettingsPanel";
import { useState } from "react";
import UserButton from "./UserButton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

type NavBarProps = {
    includeUser: boolean;
};

const NavBar = ({ includeUser }: NavBarProps) => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showMobileUserModal, setShowMobileUserModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    const { demo } = useSearch({ strict: false }) as { demo: boolean };

    const toggleDemo = () => {
        //@ts-expect-error this works and is typed im not sure why TS thinks it doesnt
        navigate({ search: { demo: !demo } });
    };

    function openSettings() {
        setShowUserModal(false);
        setShowMobileUserModal(false);
        setShowSettings(true);
    }

    return (
        <>
            <div className="bg-card border-b border-border/60 dark:border-white/[0.06]">
                {/* Mobile layout */}
                <div className="flex items-center justify-between px-4 py-3 sm:hidden">
                    <Popover
                        open={showMobileUserModal}
                        onOpenChange={setShowMobileUserModal}
                    >
                        <PopoverTrigger asChild>
                            <div>
                                <UserButton
                                    setShowUserModal={setShowMobileUserModal}
                                    includeUser={includeUser}
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-fit">
                            <UserModal onOpenSettings={openSettings} />
                        </PopoverContent>
                    </Popover>

                    <div className="flex flex-col items-center">
                        <h1 className="text-spotify-green text-xl font-bold tracking-tight">
                            ReWrapped
                        </h1>
                    </div>

                    <DarkModeButtons />
                </div>

                {/* Mobile nav row */}
                <div className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-2 dark:border-white/[0.04] sm:hidden">
                    <Link
                        to="/upload"
                        className="rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        activeProps={{
                            className:
                                "bg-spotify-green/10 text-spotify-green font-semibold",
                        }}
                    >
                        Upload
                    </Link>
                    <Link
                        to="/summary"
                        from="/summary"
                        className="rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        activeProps={{
                            className:
                                "bg-spotify-green/10 text-spotify-green font-semibold",
                        }}
                        search={(prev) => ({ ...prev, demo })}
                    >
                        Summary
                    </Link>
                    <Link
                        to="/charts"
                        from="/charts"
                        className="rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        activeProps={{
                            className:
                                "bg-spotify-green/10 text-spotify-green font-semibold",
                        }}
                        search={(prev) => ({ ...prev, demo })}
                    >
                        Charts
                    </Link>
                    <Button
                        onClick={toggleDemo}
                        variant={demo ? "default" : "ghost"}
                        size="sm"
                        className={
                            demo
                                ? "bg-spotify-green hover:bg-spotify-green/90 ml-1 text-black"
                                : "ml-1 text-muted-foreground"
                        }
                    >
                        {demo ? "Exit Demo" : "Demo"}
                    </Button>
                </div>

                {/* Desktop layout */}
                <div className="hidden items-center justify-between px-8 py-4 sm:flex">
                    <div className="flex w-40 items-center gap-3">
                        <Popover
                            open={showUserModal}
                            onOpenChange={setShowUserModal}
                        >
                            <PopoverTrigger asChild>
                                <div>
                                    <UserButton
                                        setShowUserModal={setShowUserModal}
                                        includeUser={includeUser}
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-fit">
                                <UserModal onOpenSettings={openSettings} />
                            </PopoverContent>
                        </Popover>
                        <Button
                            onClick={toggleDemo}
                            variant={demo ? "default" : "ghost"}
                            size="sm"
                            className={
                                demo
                                    ? "bg-spotify-green hover:bg-spotify-green/90 text-black"
                                    : "text-muted-foreground"
                            }
                        >
                            {demo ? "Exit Demo" : "Demo"}
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <h1 className="text-spotify-green text-2xl font-bold tracking-tight">
                            ReWrapped Spotify
                        </h1>
                        <nav className="flex items-center gap-1">
                            <Link
                                to="/upload"
                                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "bg-spotify-green/10 text-spotify-green font-semibold",
                                }}
                            >
                                Upload
                            </Link>
                            <Link
                                to="/summary"
                                from="/summary"
                                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "bg-spotify-green/10 text-spotify-green font-semibold",
                                }}
                                search={(prev) => ({ ...prev, demo })}
                            >
                                Summary
                            </Link>
                            <Link
                                to="/charts"
                                from="/charts"
                                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "bg-spotify-green/10 text-spotify-green font-semibold",
                                }}
                                search={(prev) => ({ ...prev, demo })}
                            >
                                Charts
                            </Link>
                        </nav>
                    </div>

                    <div className="flex w-40 justify-end">
                        <DarkModeButtons />
                    </div>
                </div>
            </div>

            <SettingsPanel
                open={showSettings}
                onOpenChange={setShowSettings}
            />
        </>
    );
};

export default NavBar;

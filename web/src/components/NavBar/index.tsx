import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import DarkModeButtons from "./DarkModeButtons";
import UserModal from "./modals/UserModal";
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
    const navigate = useNavigate();

    const { demo } = useSearch({ strict: false }) as { demo: boolean };

    const toggleDemo = () => {
        //@ts-expect-error this works and is typed im not sure why TS thinks it doesnt
        navigate({ search: { demo: !demo } });
    };

    return (
        <div className="dark:bg-spotify-black bg-spotify-green flex w-full items-center justify-center py-2 shadow-lg sm:px-8 sm:py-6">
            <div className="flex w-full flex-col justify-center sm:flex-row sm:justify-between">
                <div className="flex w-full items-start justify-between px-4 pb-4 sm:hidden">
                    {/* Mobile Buttons */}
                    <div className="flex flex-col items-center gap-4">
                        <UserButton
                            setShowUserModal={setShowUserModal}
                            includeUser={includeUser}
                        />
                        <Button
                            onClick={toggleDemo}
                            variant={demo ? "default" : "secondary"}
                            className={demo ? "dark:bg-spotify-green" : ""}
                        >
                            {demo ? "Exit Demo" : "Demo Mode"}
                        </Button>
                    </div>
                    <div className="sm:hidden">
                        <DarkModeButtons />
                    </div>
                </div>

                <div className="grid w-full items-center px-8 sm:grid-cols-3">
                    <div className="hidden w-30 flex-col items-center gap-4 sm:flex">
                        <Popover
                            open={showUserModal}
                            onOpenChange={setShowUserModal}
                        >
                            <PopoverTrigger asChild>
                                <div className="hidden justify-self-start sm:flex">
                                    <UserButton
                                        setShowUserModal={setShowUserModal}
                                        includeUser={includeUser}
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-fit">
                                <UserModal />
                            </PopoverContent>
                        </Popover>
                        <Button
                            onClick={toggleDemo}
                            variant={demo ? "default" : "secondary"}
                            className={demo ? "dark:bg-spotify-green" : ""}
                        >
                            {demo ? "Exit Demo" : "Demo Mode"}
                        </Button>
                    </div>

                    <div className="flex flex-col text-center">
                        <div className="dark:text-spotify-green text-spotify-black flex flex-col text-center text-4xl text-shadow-sm dark:text-shadow-xs">
                            <h1 className="text-5xl font-bold">
                                ReWrapped Spotify
                            </h1>
                            <nav className="font-base flex justify-around space-x-4 pt-4 text-lg font-medium transition-all">
                                <Link
                                    to="/"
                                    className="transition"
                                    activeProps={{
                                        className: "font-bold underline",
                                    }}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/upload"
                                    className="transition"
                                    activeProps={{
                                        className: "font-bold underline",
                                    }}
                                >
                                    Upload
                                </Link>
                                <Link
                                    to="/summary"
                                    from="/summary"
                                    className="transition"
                                    activeProps={{
                                        className: "font-bold underline",
                                    }}
                                    search={{ demo }}
                                >
                                    Analyze
                                </Link>
                                <Link
                                    to="/charts"
                                    from="/charts"
                                    className="transition"
                                    activeProps={{
                                        className: "font-bold underline",
                                    }}
                                    search={{ demo }}
                                >
                                    Charts
                                </Link>
                            </nav>
                        </div>
                    </div>
                    <div className="hidden justify-end sm:flex">
                        <DarkModeButtons />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;

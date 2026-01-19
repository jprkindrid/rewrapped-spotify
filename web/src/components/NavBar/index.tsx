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
import clsx from "clsx";

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
        <div className="dark:bg-spotify-black bg-spotify-green flex w-full items-center justify-center px-8 shadow-lg transition sm:py-6">
            <div className="flex w-full flex-col justify-center py-4 sm:flex-row sm:justify-between sm:py-0">
                <div className="flex w-full justify-between px-4 pb-4 sm:hidden">
                    <div className="flex items-center">
                        <UserButton
                            setShowUserModal={setShowUserModal}
                            includeUser={includeUser}
                        />
                        <button
                            onClick={toggleDemo}
                            className="rounded-md bg-neutral-800 px-3 py-1 text-white transition hover:bg-neutral-700"
                        >
                            {demo ? "Exit Demo" : "Demo Mode"}
                        </button>
                    </div>
                    <div className="sm:hidden">
                        <DarkModeButtons />
                    </div>
                </div>

                <div className="grid w-full grid-cols-3 items-center px-8 transition">
                    <div className="gap flex w-30 flex-col transition">
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
                        <button
                            onClick={toggleDemo}
                            className={clsx(
                                "rounded-md bg-neutral-800 px-2 py-2 text-white transition hover:bg-neutral-700",
                                demo && "bg-spotify-green text-neutral-800"
                            )}
                        >
                            {demo ? "Exit Demo" : "Demo Mode"}
                        </button>
                    </div>

                    <div className="flex flex-col text-center">
                        <div className="dark:text-spotify-green text-spotify-black text-4xl text-shadow-sm dark:text-shadow-xs">
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

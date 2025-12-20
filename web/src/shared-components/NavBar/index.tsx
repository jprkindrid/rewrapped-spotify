import { Link } from "@tanstack/react-router";
import DarkModeButtons from "./DarkModeButtons";
import UserModal from "./modals/UserModal";
import { useState } from "react";
import UserButton from "./UserButton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type NavBarProps = {
    includeUser: boolean;
};

const NavBar = ({ includeUser }: NavBarProps) => {
    const [showUserModal, setShowUserModal] = useState(false);

    // TODO: GET USER ID DATA HERE FROM CONTEXT

    return (
        <div className="dark:bg-spotify-black bg-spotify-green flex w-full items-center justify-center px-8 shadow-lg transition sm:py-6">
            <div className="flex w-full flex-col justify-center py-4 sm:flex-row sm:justify-between sm:py-0">
                <div className="flex w-full justify-between px-4 pb-4 sm:hidden">
                    <div className="flex items-center">
                        <UserButton
                            setShowUserModal={setShowUserModal}
                            includeUser={includeUser}
                        />
                    </div>
                    <div className="sm:hidden">
                        <DarkModeButtons />
                    </div>
                </div>

                <div className="grid w-full grid-cols-3 items-center px-8">
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
                                        className: " font-bold underline",
                                    }}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/upload"
                                    className="transition"
                                    activeProps={{
                                        className: " font-bold underline",
                                    }}
                                >
                                    Upload
                                </Link>
                                <Link
                                    to="/summary"
                                    className="transition"
                                    activeProps={{
                                        className: " font-bold underline",
                                    }}
                                >
                                    Analyze
                                </Link>
                                <Link
                                    to="/demo"
                                    className="transition"
                                    activeProps={{
                                        className: " font-bold underline",
                                    }}
                                >
                                    Demo
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

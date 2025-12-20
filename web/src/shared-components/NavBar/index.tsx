import { Link } from "@tanstack/react-router";
import DarkModeButtons from "./DarkModeButtons";
import UserModal from "./modals/UserModal";
import { useRef, useState, useEffect } from "react";
import UserButton from "./UserButton";

type NavBarProps = {
    includeUser: boolean;
};

const NavBar = ({ includeUser }: NavBarProps) => {
    const [showUserModal, setShowUserModal] = useState(false);
    const userModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                userModalRef.current &&
                !userModalRef.current.contains(e.target as Node)
            ) {
                setShowUserModal(false);
            }
        };

        if (showUserModal)
            document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showUserModal]);

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

                <div className="flex w-full items-center justify-start px-8">
                    <div className="hidden w-1/3 items-center sm:flex">
                        <UserButton
                            setShowUserModal={setShowUserModal}
                            includeUser={includeUser}
                        />
                    </div>

                    {showUserModal && (
                        <div
                            ref={userModalRef}
                            className="absolute top-0 left-0 rounded-lg border border-neutral-300 bg-neutral-100 p-6 shadow-lg transition dark:border-neutral-700 dark:bg-neutral-900"
                        >
                            <UserModal />
                        </div>
                    )}

                    <div className="flex w-full flex-col text-center sm:w-1/3">
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
                    <div className="hidden w-1/3 justify-end sm:flex">
                        <DarkModeButtons />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;

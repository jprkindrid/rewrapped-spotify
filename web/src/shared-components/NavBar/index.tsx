import { Link } from "@tanstack/react-router";
import DarkModeButtons from "./DarkModeButtons";
import type { UserIdData } from "../UserIdData";
import UserModal from "./modals/UserModal";
import { useRef, useState, useEffect } from "react";
import UserButton from "./UserButton";

type NavBarProps = {
    userIdData: UserIdData | undefined;
    includeUser: boolean;
};

const NavBar = ({ userIdData, includeUser }: NavBarProps) => {
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

    return (
        <div className="dark:bg-spotify-black bg-spotify-green flex w-full items-center justify-center px-8 shadow-lg transition sm:py-6">
            <div className="flex w-full flex-col justify-center py-4 sm:flex-row sm:justify-between sm:py-0">
                <div className="flex w-full justify-between px-4 pb-4 sm:hidden">
                    <div className="flex items-center">
                        <UserButton
                            setShowUserModal={setShowUserModal}
                            includeUser={includeUser}
                            userIdData={userIdData}
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
                            userIdData={userIdData}
                        />
                    </div>

                    {showUserModal && (
                        <div
                            ref={userModalRef}
                            className="absolute top-0 left-0 rounded-br-lg border-r border-b border-stone-500 bg-stone-300 p-6 transition dark:bg-stone-900"
                        >
                            <UserModal />
                        </div>
                    )}

                    <div className="flex w-full flex-col text-center sm:w-1/3">
                        <div className="dark:text-spotify-green text-spotify-black dark:text-shadow-spotify-green text-4xl text-shadow-sm dark:text-shadow-xs">
                            <h1 className="font-bold">ReWrapped Spotify</h1>
                            <nav className="font-base flex justify-around space-x-2 pt-4 text-xl">
                                <Link to="/" className="">
                                    Home
                                </Link>
                                <Link to="/upload">Upload</Link>
                                <Link to="/summary">Analyze</Link>
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

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
        <div className="bg-spotify-black relative flex w-screen items-center justify-center px-4 py-8 font-sans shadow-sm">
            <div className="w-full max-w-5xl">
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

                <div className="flex w-full items-center justify-between px-8">
                    <div className="hidden sm:flex">
                        <UserButton
                            setShowUserModal={setShowUserModal}
                            includeUser={includeUser}
                            userIdData={userIdData}
                        />
                    </div>

                    {showUserModal && (
                        <div
                            ref={userModalRef}
                            className="absolute top-0 left-0 rounded-br-lg border-r border-b border-stone-500 bg-stone-900 p-6 transition"
                        >
                            <UserModal />
                        </div>
                    )}

                    <div className="mx-auto flex max-w-xl flex-col text-center">
                        <div className="text-spotify-green text-4xl">
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
                    <div className="hidden w-60 justify-center sm:flex">
                        <DarkModeButtons />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;

import { Link } from "@tanstack/react-router";
import DarkModeButtons from "./DarkModeButtons";
import type { UserIdData } from "../UserIdData";
import UserModal from "./modals/UserModal";
import { useRef, useState, useEffect } from "react";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserModal]);

  return (
    <div className="bg-spotify-black relative flex w-full justify-center pt-6 pb-6 font-sans shadow-sm">
      <div className="mx-8 flex w-full items-center justify-between">
        <div className="hidden w-60 space-x-4 text-white sm:flex">
          <button
            className="hover:text-spotify-green flex text-white transition"
            onClick={() => {
              setShowUserModal(true);
            }}
          >
            {includeUser && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
            <span className="pl-1">
              {includeUser
                ? userIdData
                  ? userIdData.display_name
                  : "Loading..."
                : ""}
            </span>
          </button>
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
        <div className="hidden w-60 justify-end sm:flex">
          <DarkModeButtons />
        </div>
      </div>
    </div>
  );
};

export default NavBar;

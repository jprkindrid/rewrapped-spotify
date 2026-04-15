import { useAuth } from "@/hooks/useAuth";
import type { Dispatch, SetStateAction } from "react";

type Props = {
    setShowUserModal: Dispatch<SetStateAction<boolean>>;
    includeUser: boolean;
};

const UserButton = ({ setShowUserModal, includeUser }: Props) => {
    const { displayName } = useAuth();
    return (
        <button
            className="flex w-fit items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                    className="size-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                </svg>
            )}
            <span>
                {includeUser ? (displayName ? displayName : "Loading...") : ""}
            </span>
        </button>
    );
};

export default UserButton;

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { deleteData } from "@/services/summary";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface UserModalProps {
    onOpenSettings: () => void;
}

const UserModal = ({ onOpenSettings }: UserModalProps) => {
    const navigate = useNavigate();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();
    const { token, logout: clearAuth } = useAuth();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDelete() {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await deleteData(token!);
            if (res.ok) {
                clearAuth();
                navigate({ to: "/" });
            } else {
                const message = await res.text();
                setDeleteError(
                    message || "Failed to delete account. Please try again."
                );
            }
        } catch {
            setDeleteError("Something went wrong. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-2">
                <Button
                    variant="ghost"
                    onClick={onOpenSettings}
                    className="justify-start"
                >
                    <Settings className="size-5" />
                    Settings
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="justify-start"
                >
                    <LogOut className="size-5" />
                    Logout
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2 className="size-5" />
                    Delete Account
                </Button>
            </div>

            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            This will permanently delete your account and all
                            your streaming data. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                        <p className="text-sm text-destructive">{deleteError}</p>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserModal;

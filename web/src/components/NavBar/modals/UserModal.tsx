import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { deleteData } from "@/services/summary";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Trash2, Save } from "lucide-react";
import SaveDataDialog from "@/components/SaveDataDialog";
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
    const { token, isGuest, logout: clearAuth } = useAuth();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showSave, setShowSave] = useState(false);
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
                {isGuest ? (
                    <Button
                        variant="ghost"
                        onClick={() => setShowSave(true)}
                        className="text-spotify-green hover:text-spotify-green justify-start"
                    >
                        <Save className="size-5" />
                        Save my data
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={onOpenSettings}
                        className="justify-start"
                    >
                        <Settings className="size-5" />
                        Settings
                    </Button>
                )}
                <Button
                    variant="ghost"
                    onClick={() =>
                        isGuest ? setShowLeaveConfirm(true) : logout()
                    }
                    disabled={isLoggingOut}
                    className="justify-start"
                >
                    <LogOut className="size-5" />
                    {isGuest ? "Leave guest session" : "Logout"}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive justify-start"
                >
                    <Trash2 className="size-5" />
                    {isGuest ? "Delete my data" : "Delete Account"}
                </Button>
            </div>

            <SaveDataDialog open={showSave} onOpenChange={setShowSave} />

            <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave guest session?</DialogTitle>
                        <DialogDescription>
                            Guest data is tied to this browser. If you leave
                            without saving it to an account, you won&apos;t be
                            able to get back to it, and it&apos;s deleted when
                            it expires.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowLeaveConfirm(false);
                                setShowSave(true);
                            }}
                        >
                            Save my data
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowLeaveConfirm(false);
                                logout();
                            }}
                            disabled={isLoggingOut}
                        >
                            Leave anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isGuest ? "Delete my data" : "Delete Account"}
                        </DialogTitle>
                        <DialogDescription>
                            {isGuest
                                ? "This will permanently delete your uploaded streaming data now instead of waiting for it to expire. This can't be undone."
                                : "This will permanently delete your account and all your streaming data. This action cannot be undone."}
                        </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                        <p className="text-destructive text-sm">
                            {deleteError}
                        </p>
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
                            {isDeleting
                                ? "Deleting..."
                                : isGuest
                                  ? "Delete my data"
                                  : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserModal;

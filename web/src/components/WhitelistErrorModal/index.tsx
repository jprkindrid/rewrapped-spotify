import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

interface WhitelistErrorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const WhitelistErrorModal = ({ open, onOpenChange }: WhitelistErrorModalProps) => {
    const navigate = useNavigate();

    const handleDemoMode = () => {
        onOpenChange(false);
        navigate({ to: "/summary", search: { demo: true } });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Login Restricted</DialogTitle>
                    <DialogDescription>
                        Due to Spotify's API restrictions, this app is currently
                        in development mode and can only authenticate pre-approved users.
                    </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    In the meantime, you can explore the app using demo data!
                </p>
                <Button onClick={handleDemoMode} className="mt-4 w-full">
                    Try Demo Mode
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default WhitelistErrorModal;

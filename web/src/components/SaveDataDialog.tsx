import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEmailEnabled } from "@/hooks/useEmailEnabled";
import * as authService from "@/services/auth";

type SaveDataDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Method = "password" | "link";

/** Turns a guest session into an account, keeping its uploaded data. */
const SaveDataDialog = ({ open, onOpenChange }: SaveDataDialogProps) => {
    const { token, login } = useAuth();
    const emailEnabled = useEmailEnabled();

    const [chosenMethod, setMethod] = useState<Method>("password");
    // Without email, a password is the only way to sign back in.
    const method: Method = emailEnabled ? chosenMethod : "password";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const claimMutation = useMutation({
        mutationFn: () =>
            authService.claimGuestData(token!, {
                email,
                password: method === "password" ? password : undefined,
                displayName,
            }),
        onSuccess: (data) => {
            if (data.token) {
                login(data.token);
                handleOpenChange(false);
            } else {
                setSentTo(email.trim());
            }
        },
        onError: (err: Error) => setError(err.message),
    });

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
        if (!next) {
            setError(null);
            setSentTo(null);
            setPassword("");
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        claimMutation.mutate();
    }

    const inputClass =
        "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-spotify-green focus:ring-1 focus:ring-spotify-green/30";
    const tabClass = (active: boolean) =>
        `flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:outline-none ${
            active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
        }`;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save your data</DialogTitle>
                    <DialogDescription>
                        Create an account to keep your listening history. You
                        won&apos;t need to upload it again.
                    </DialogDescription>
                </DialogHeader>

                {sentTo ? (
                    <div className="flex flex-col gap-2 text-sm" role="status">
                        <p className="font-medium">Check your email</p>
                        <p className="text-muted-foreground">
                            We sent a confirmation link to{" "}
                            <span className="text-foreground font-medium">
                                {sentTo}
                            </span>
                            . Open it to finish saving your data.
                        </p>
                        <DialogFooter>
                            <Button onClick={() => handleOpenChange(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        {emailEnabled && (
                            <div
                                className="bg-muted flex rounded-lg p-0.5"
                                role="radiogroup"
                                aria-label="How to sign in later"
                            >
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={method === "password"}
                                    onClick={() => setMethod("password")}
                                    className={tabClass(method === "password")}
                                >
                                    Use a password
                                </button>
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={method === "link"}
                                    onClick={() => setMethod("link")}
                                    className={tabClass(method === "link")}
                                >
                                    Email links only
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="save-email"
                                className="text-muted-foreground text-xs font-medium"
                            >
                                Email
                            </label>
                            <input
                                id="save-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                                disabled={claimMutation.isPending}
                                autoComplete="email"
                            />
                        </div>

                        {method === "password" ? (
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="save-password"
                                    className="text-muted-foreground text-xs font-medium"
                                >
                                    Password
                                </label>
                                <input
                                    id="save-password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="At least 8 characters"
                                    className={inputClass}
                                    disabled={claimMutation.isPending}
                                    autoComplete="new-password"
                                />
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-xs">
                                We&apos;ll email you a link to confirm. After
                                that, sign in any time with an emailed link. You
                                can add a password later in settings.
                            </p>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="save-display-name"
                                className="text-muted-foreground text-xs font-medium"
                            >
                                Display Name{" "}
                                <span className="text-muted-foreground/60">
                                    (optional)
                                </span>
                            </label>
                            <input
                                id="save-display-name"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className={inputClass}
                                disabled={claimMutation.isPending}
                            />
                        </div>

                        {error && (
                            <p
                                className="text-destructive text-sm"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={claimMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={claimMutation.isPending}
                                className="bg-spotify-green hover:bg-spotify-green/90 text-black"
                            >
                                {claimMutation.isPending
                                    ? "Saving..."
                                    : method === "password"
                                      ? "Create Account"
                                      : "Send Confirmation"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SaveDataDialog;

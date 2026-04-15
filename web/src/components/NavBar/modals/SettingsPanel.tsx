import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import * as accountService from "@/services/account";

interface SettingsPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SettingsPanel = ({ open, onOpenChange }: SettingsPanelProps) => {
    const { token, userId, displayName, login } = useAuth();

    // Display name form
    const [newDisplayName, setNewDisplayName] = useState(displayName ?? "");
    const [displayNameSuccess, setDisplayNameSuccess] = useState<string | null>(
        null
    );
    const [displayNameError, setDisplayNameError] = useState<string | null>(
        null
    );
    const [displayNamePending, setDisplayNamePending] = useState(false);

    // Email form
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailPending, setEmailPending] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordPending, setPasswordPending] = useState(false);

    async function handleDisplayNameSubmit(e: FormEvent) {
        e.preventDefault();
        setDisplayNameError(null);
        setDisplayNameSuccess(null);
        setDisplayNamePending(true);

        try {
            const data = await accountService.updateDisplayName(
                token!,
                newDisplayName.trim()
            );
            login(data.token);
            setDisplayNameSuccess("Display name updated.");
        } catch (err) {
            setDisplayNameError(
                err instanceof Error ? err.message : "Failed to update."
            );
        } finally {
            setDisplayNamePending(false);
        }
    }

    async function handleEmailSubmit(e: FormEvent) {
        e.preventDefault();
        setEmailError(null);
        setEmailSuccess(null);
        setEmailPending(true);

        try {
            const data = await accountService.updateEmail(
                token!,
                newEmail.trim(),
                emailPassword
            );
            login(data.token);
            setNewEmail("");
            setEmailPassword("");
            setEmailSuccess("Email updated.");
        } catch (err) {
            setEmailError(
                err instanceof Error ? err.message : "Failed to update."
            );
        } finally {
            setEmailPending(false);
        }
    }

    async function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        setPasswordPending(true);

        try {
            await accountService.updatePassword(
                token!,
                currentPassword,
                newPassword
            );
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setPasswordSuccess("Password updated.");
        } catch (err) {
            setPasswordError(
                err instanceof Error ? err.message : "Failed to update."
            );
        } finally {
            setPasswordPending(false);
        }
    }

    const inputClass =
        "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-spotify-green";
    const labelClass =
        "text-sm font-medium text-muted-foreground";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Account Settings</SheetTitle>
                    <SheetDescription>
                        Signed in as {userId}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 overflow-y-auto pr-1">
                    {/* Display Name */}
                    <form
                        onSubmit={handleDisplayNameSubmit}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4"
                    >
                        <h3 className="text-sm font-semibold">Display Name</h3>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="settings-display-name" className={labelClass}>
                                Name
                            </label>
                            <input
                                id="settings-display-name"
                                type="text"
                                value={newDisplayName}
                                onChange={(e) =>
                                    setNewDisplayName(e.target.value)
                                }
                                placeholder="Your name"
                                className={inputClass}
                                disabled={displayNamePending}
                            />
                        </div>
                        {displayNameError && (
                            <p className="text-sm text-destructive">
                                {displayNameError}
                            </p>
                        )}
                        {displayNameSuccess && (
                            <p className="text-sm text-spotify-green">
                                {displayNameSuccess}
                            </p>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={displayNamePending}
                        >
                            {displayNamePending ? "Saving..." : "Update Name"}
                        </Button>
                    </form>

                    {/* Change Email */}
                    <form
                        onSubmit={handleEmailSubmit}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4"
                    >
                        <h3 className="text-sm font-semibold">Change Email</h3>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="settings-new-email" className={labelClass}>
                                New Email
                            </label>
                            <input
                                id="settings-new-email"
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new@example.com"
                                className={inputClass}
                                disabled={emailPending}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="settings-email-password" className={labelClass}>
                                Current Password
                            </label>
                            <input
                                id="settings-email-password"
                                type="password"
                                required
                                value={emailPassword}
                                onChange={(e) =>
                                    setEmailPassword(e.target.value)
                                }
                                placeholder="Confirm your password"
                                className={inputClass}
                                disabled={emailPending}
                                autoComplete="current-password"
                            />
                        </div>
                        {emailError && (
                            <p className="text-sm text-destructive">{emailError}</p>
                        )}
                        {emailSuccess && (
                            <p className="text-sm text-spotify-green">
                                {emailSuccess}
                            </p>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={emailPending}
                        >
                            {emailPending ? "Saving..." : "Update Email"}
                        </Button>
                    </form>

                    {/* Change Password */}
                    <form
                        onSubmit={handlePasswordSubmit}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4"
                    >
                        <h3 className="text-sm font-semibold">
                            Change Password
                        </h3>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="settings-current-pw" className={labelClass}>
                                Current Password
                            </label>
                            <input
                                id="settings-current-pw"
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                placeholder="Current password"
                                className={inputClass}
                                disabled={passwordPending}
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="settings-new-pw" className={labelClass}>
                                New Password
                            </label>
                            <input
                                id="settings-new-pw"
                                type="password"
                                required
                                minLength={8}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                className={inputClass}
                                disabled={passwordPending}
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="settings-confirm-pw" className={labelClass}>
                                Confirm New Password
                            </label>
                            <input
                                id="settings-confirm-pw"
                                type="password"
                                required
                                minLength={8}
                                value={confirmNewPassword}
                                onChange={(e) =>
                                    setConfirmNewPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                                className={inputClass}
                                disabled={passwordPending}
                                autoComplete="new-password"
                            />
                        </div>
                        {passwordError && (
                            <p className="text-sm text-destructive">
                                {passwordError}
                            </p>
                        )}
                        {passwordSuccess && (
                            <p className="text-sm text-spotify-green">
                                {passwordSuccess}
                            </p>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={passwordPending}
                        >
                            {passwordPending
                                ? "Saving..."
                                : "Update Password"}
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SettingsPanel;

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/auth";
import * as accountService from "@/services/account";

const SUMMARY_SEARCH = {
    demo: false,
    from: undefined,
    to: undefined,
    sortBy: undefined,
    interval: undefined,
    query: undefined,
};

type Stage =
    | { kind: "verifying" }
    | { kind: "failed"; message: string }
    | { kind: "set-password" };

const VerifyPage = () => {
    const navigate = useNavigate();
    const { token: linkToken } = useSearch({ strict: false }) as {
        token?: string;
    };
    const { login } = useAuth();

    // Captured once: the token is removed from the URL straight away so it
    // doesn't linger in history or get shared by accident.
    const [initialToken] = useState(linkToken);
    const [stage, setStage] = useState<Stage>(
        initialToken
            ? { kind: "verifying" }
            : { kind: "failed", message: "This link is missing its code." }
    );
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Links work once; React's dev double-invoked effects would spend it twice.
    const started = useRef(false);

    useEffect(() => {
        if (!initialToken || started.current) return;
        started.current = true;

        navigate({ search: {} as never, replace: true });

        authService
            .verifyEmailLink(initialToken)
            .then((res) => {
                login(res.token);
                if (res.purpose === "reset") {
                    setSessionToken(res.token);
                    setStage({ kind: "set-password" });
                } else {
                    navigate({
                        to: "/summary",
                        search: SUMMARY_SEARCH,
                        replace: true,
                    });
                }
            })
            .catch((err: Error) =>
                setStage({ kind: "failed", message: err.message })
            );
    }, [initialToken, login, navigate]);

    const passwordMutation = useMutation({
        mutationFn: () =>
            accountService.updatePassword(sessionToken!, "", newPassword),
        onSuccess: (data) => {
            login(data.token);
            navigate({ to: "/summary", search: SUMMARY_SEARCH, replace: true });
        },
        onError: (err: Error) => setPasswordError(err.message),
    });

    function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        setPasswordError(null);
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        passwordMutation.mutate();
    }

    const inputClass =
        "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-spotify-green focus:ring-1 focus:ring-spotify-green/30";

    return (
        <div className="bg-background relative flex min-h-screen w-full flex-col items-center">
            <div className="bg-spotify-green/[0.06] pointer-events-none absolute top-0 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full blur-3xl" />

            <div className="relative z-10 mx-3 w-full max-w-md pt-20">
                <h1 className="text-spotify-green mb-8 text-center text-3xl font-bold tracking-tight">
                    ReWrapped
                </h1>

                <div className="page-section border-t-spotify-green/40 flex flex-col gap-4 rounded-xl border-t-2 p-6">
                    {stage.kind === "verifying" && (
                        <div
                            className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm"
                            role="status"
                        >
                            <Loader2
                                className="size-4 animate-spin"
                                aria-hidden
                            />
                            Checking your link...
                        </div>
                    )}

                    {stage.kind === "failed" && (
                        <div
                            className="flex flex-col gap-3 text-center"
                            role="alert"
                        >
                            <h2 className="text-lg font-semibold">
                                That link didn&apos;t work
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {stage.message}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Links expire after a few minutes and work once.
                                You can request a new one.
                            </p>
                            <Link
                                to="/"
                                className="text-spotify-green font-medium hover:underline"
                            >
                                Back to log in
                            </Link>
                        </div>
                    )}

                    {stage.kind === "set-password" && (
                        <form
                            onSubmit={handlePasswordSubmit}
                            className="flex flex-col gap-4"
                        >
                            <h2 className="text-center text-lg font-semibold">
                                Choose a new password
                            </h2>
                            <p className="text-muted-foreground text-center text-sm">
                                This signs you out everywhere else.
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="new-password"
                                    className="text-muted-foreground text-xs font-medium"
                                >
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className={inputClass}
                                    disabled={passwordMutation.isPending}
                                    autoComplete="new-password"
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="confirm-new-password"
                                    className="text-muted-foreground text-xs font-medium"
                                >
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-new-password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className={inputClass}
                                    disabled={passwordMutation.isPending}
                                    autoComplete="new-password"
                                />
                            </div>
                            {passwordError && (
                                <p
                                    className="text-destructive text-sm"
                                    role="alert"
                                >
                                    {passwordError}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={passwordMutation.isPending}
                                className="bg-spotify-green rounded-lg px-6 py-2.5 text-sm font-semibold text-black transition-all hover:cursor-pointer hover:brightness-110 disabled:opacity-60"
                            >
                                {passwordMutation.isPending
                                    ? "Saving..."
                                    : "Save Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;

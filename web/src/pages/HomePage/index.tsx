import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { usePingApi } from "@/hooks/usePingAPi";
import { useAuth } from "@/hooks/useAuth";
import Explanation from "@/components/Explanation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SourceLink from "@/components/SourceLink";
import * as authService from "@/services/auth";

type AuthMode = "login" | "register" | "link" | "reset";

const TITLES: Record<AuthMode, string> = {
    login: "Log In",
    register: "Create Account",
    link: "Email Me a Sign-In Link",
    reset: "Reset Password",
};

const SUBMIT_LABELS: Record<AuthMode, string> = {
    login: "Log In",
    register: "Create Account",
    link: "Send Sign-In Link",
    reset: "Send Reset Link",
};

const HomePage = () => {
    const navigate = useNavigate();
    const { token, login } = useAuth();

    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
    const [showRegistered, setShowRegistered] = useState(false);

    usePingApi();

    useEffect(() => {
        if (token && !showRegistered) {
            navigate({ to: "/upload" });
        }
    }, [token, showRegistered, navigate]);

    const onError = (fallback: string) => (err: Error) =>
        setFormError(err.message || fallback);

    const loginMutation = useMutation({
        mutationFn: () => authService.loginUser(email, password),
        onSuccess: (data) => login(data.token),
        onError: onError("Login failed. Please try again."),
    });

    const registerMutation = useMutation({
        mutationFn: () =>
            authService.registerUser(email, password, displayName || undefined),
        onSuccess: (data) => {
            setShowRegistered(true);
            login(data.token);
        },
        onError: onError("Registration failed. Please try again."),
    });

    const linkMutation = useMutation({
        mutationFn: (purpose: authService.EmailLinkPurpose) =>
            authService.requestEmailLink(email, purpose),
        onSuccess: () => setLinkSentTo(email.trim()),
        onError: onError("Couldn't send the email. Please try again."),
    });

    const guestMutation = useMutation({
        mutationFn: authService.startGuestSession,
        onSuccess: (data) => login(data.token),
        onError: onError("Couldn't start a guest session. Please try again."),
    });

    const isPending =
        loginMutation.isPending ||
        registerMutation.isPending ||
        linkMutation.isPending ||
        guestMutation.isPending;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        switch (mode) {
            case "login":
                loginMutation.mutate();
                break;
            case "register":
                if (password !== confirmPassword) {
                    setFormError("Passwords do not match.");
                    return;
                }
                registerMutation.mutate();
                break;
            case "link":
                linkMutation.mutate("login");
                break;
            case "reset":
                linkMutation.mutate("reset");
                break;
        }
    }

    function switchMode(next: AuthMode) {
        setMode(next);
        setFormError(null);
        setLinkSentTo(null);
    }

    const needsPassword = mode === "login" || mode === "register";

    const inputClass =
        "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-spotify-green focus:ring-1 focus:ring-spotify-green/30";
    const linkButtonClass =
        "text-spotify-green font-medium hover:underline focus-visible:underline focus-visible:outline-none";

    return (
        <div className="bg-background relative flex min-h-screen w-full flex-col items-center transition">
            {/* Ambient glow */}
            <div className="bg-spotify-green/[0.06] pointer-events-none absolute top-0 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full blur-3xl" />

            <div className="relative z-10 mx-3 w-full max-w-md pt-20">
                <h1 className="text-spotify-green mb-1 text-center text-3xl font-bold tracking-tight">
                    ReWrapped
                </h1>
                <p className="text-muted-foreground mb-8 text-center text-sm">
                    Your Spotify listening history, visualized.
                </p>

                {linkSentTo ? (
                    <div className="page-section border-t-spotify-green/40 flex flex-col gap-4 rounded-xl border-t-2 p-6 text-center">
                        <h2 className="text-lg font-semibold">
                            Check your email
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            If an account exists for{" "}
                            <span className="text-foreground font-medium">
                                {linkSentTo}
                            </span>
                            , we&apos;ve sent a link. It expires soon and works
                            once.
                        </p>
                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className={linkButtonClass}
                        >
                            Back to log in
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="page-section border-t-spotify-green/40 flex flex-col gap-4 rounded-xl border-t-2 p-6"
                    >
                        <h2 className="text-center text-lg font-semibold">
                            {TITLES[mode]}
                        </h2>

                        {mode === "reset" && (
                            <p className="text-muted-foreground text-center text-sm">
                                Enter your account&apos;s email and we&apos;ll
                                send you a link to choose a new password.
                            </p>
                        )}

                        {mode === "register" && (
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="displayName"
                                    className="text-muted-foreground text-xs font-medium"
                                >
                                    Display Name{" "}
                                    <span className="text-muted-foreground/60">
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.target.value)
                                    }
                                    placeholder="Your name"
                                    className={inputClass}
                                    disabled={isPending}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-muted-foreground text-xs font-medium"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                                disabled={isPending}
                                autoComplete="email"
                            />
                        </div>

                        {needsPassword && (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-baseline justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-muted-foreground text-xs font-medium"
                                    >
                                        Password
                                    </label>
                                    {mode === "login" && (
                                        <button
                                            type="button"
                                            onClick={() => switchMode("reset")}
                                            className="text-muted-foreground hover:text-foreground text-xs hover:underline focus-visible:underline focus-visible:outline-none"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={
                                        mode === "register" ? 8 : undefined
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className={inputClass}
                                    disabled={isPending}
                                    autoComplete={
                                        mode === "login"
                                            ? "current-password"
                                            : "new-password"
                                    }
                                />
                            </div>
                        )}

                        {mode === "register" && (
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-muted-foreground text-xs font-medium"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className={inputClass}
                                    disabled={isPending}
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        {formError && (
                            <p
                                className="text-destructive text-sm"
                                role="alert"
                            >
                                {formError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-spotify-green mt-1 rounded-lg px-6 py-2.5 text-sm font-semibold text-black transition-all hover:cursor-pointer hover:brightness-110 disabled:opacity-60"
                        >
                            {isPending ? "Please wait..." : SUBMIT_LABELS[mode]}
                        </button>

                        {mode === "login" && (
                            <button
                                type="button"
                                onClick={() => switchMode("link")}
                                className="text-muted-foreground hover:text-foreground text-sm hover:underline focus-visible:underline focus-visible:outline-none"
                            >
                                Email me a sign-in link instead
                            </button>
                        )}

                        <p className="text-muted-foreground text-center text-sm">
                            {mode === "register" ? (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => switchMode("login")}
                                        className={linkButtonClass}
                                    >
                                        Log In
                                    </button>
                                </>
                            ) : mode === "login" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => switchMode("register")}
                                        className={linkButtonClass}
                                    >
                                        Register
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => switchMode("login")}
                                    className={linkButtonClass}
                                >
                                    Back to log in
                                </button>
                            )}
                        </p>

                        <div className="text-muted-foreground/70 flex items-center gap-3 text-xs">
                            <div className="bg-border/60 h-px flex-1" />
                            or
                            <div className="bg-border/60 h-px flex-1" />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setFormError(null);
                                guestMutation.mutate();
                            }}
                            disabled={isPending}
                            className="border-border hover:bg-accent rounded-lg border px-6 py-2.5 text-sm font-semibold transition-colors hover:cursor-pointer disabled:opacity-60"
                        >
                            Continue without an account
                        </button>
                        <p className="text-muted-foreground -mt-2 text-center text-xs">
                            Your upload is kept for 7 days. Save it to an
                            account anytime.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate({
                                    to: "/summary",
                                    search: {
                                        demo: true,
                                        from: undefined,
                                        to: undefined,
                                        sortBy: undefined,
                                        interval: undefined,
                                        query: undefined,
                                    },
                                })
                            }
                            className="text-spotify-green/70 hover:text-spotify-green rounded-md py-1 text-sm font-medium transition-colors"
                        >
                            Try Demo Mode
                        </button>
                    </form>
                )}
            </div>

            <div className="relative z-10 mx-3 w-full max-w-5xl pb-16">
                <Explanation />
                <div className="mt-10 flex justify-center">
                    <SourceLink variant="text" />
                </div>
            </div>

            <Dialog open={showRegistered} onOpenChange={setShowRegistered}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Account Created</DialogTitle>
                        <DialogDescription>
                            Your account has been created successfully. You can
                            now upload your Spotify streaming history.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => navigate({ to: "/upload" })}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HomePage;

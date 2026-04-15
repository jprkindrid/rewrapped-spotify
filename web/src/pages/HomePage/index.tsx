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
import * as authService from "@/services/auth";

type AuthMode = "login" | "register";

const HomePage = () => {
    const navigate = useNavigate();
    const { token, login } = useAuth();

    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [showRegistered, setShowRegistered] = useState(false);

    usePingApi();

    useEffect(() => {
        if (token) {
            navigate({ to: "/upload" });
        }
    }, [token, navigate]);

    const loginMutation = useMutation({
        mutationFn: () => authService.loginUser(email, password),
        onSuccess: (data) => {
            login(data.token);
            navigate({ to: "/upload" });
        },
        onError: (err: Error) => {
            setFormError(err.message || "Login failed. Please try again.");
        },
    });

    const registerMutation = useMutation({
        mutationFn: () =>
            authService.registerUser(
                email,
                password,
                displayName || undefined
            ),
        onSuccess: (data) => {
            login(data.token);
            setShowRegistered(true);
        },
        onError: (err: Error) => {
            setFormError(
                err.message || "Registration failed. Please try again."
            );
        },
    });

    const isPending = loginMutation.isPending || registerMutation.isPending;

    function validate(): string | null {
        if (mode === "register" && password !== confirmPassword)
            return "Passwords do not match.";
        return null;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        if (mode === "login") {
            loginMutation.mutate();
        } else {
            registerMutation.mutate();
        }
    }

    function switchMode() {
        setMode((m) => (m === "login" ? "register" : "login"));
        setFormError(null);
    }

    const inputClass =
        "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-spotify-green focus:ring-1 focus:ring-spotify-green/30";

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center bg-background transition">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-spotify-green/[0.06] blur-3xl" />

            <div className="relative z-10 mx-3 w-full max-w-md pt-20">
                <h1 className="text-spotify-green mb-1 text-center text-3xl font-bold tracking-tight">
                    ReWrapped
                </h1>
                <p className="mb-8 text-center text-sm text-muted-foreground">
                    Your Spotify listening history, visualized.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="page-section flex flex-col gap-4 rounded-xl border-t-2 border-t-spotify-green/40 p-6"
                >
                    <h2 className="text-center text-lg font-semibold">
                        {mode === "login" ? "Log In" : "Create Account"}
                    </h2>

                    {mode === "register" && (
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="displayName"
                                className="text-xs font-medium text-muted-foreground"
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
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className={inputClass}
                                disabled={isPending}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-xs font-medium text-muted-foreground"
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

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-xs font-medium text-muted-foreground"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                    {mode === "register" && (
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="confirmPassword"
                                className="text-xs font-medium text-muted-foreground"
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
                        <p className="text-sm text-destructive">{formError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-spotify-green mt-1 rounded-lg px-6 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 hover:cursor-pointer disabled:opacity-60"
                    >
                        {isPending
                            ? "Please wait..."
                            : mode === "login"
                              ? "Log In"
                              : "Create Account"}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        {mode === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="text-spotify-green font-medium hover:underline"
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="text-spotify-green font-medium hover:underline"
                                >
                                    Log In
                                </button>
                            </>
                        )}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate({
                                to: "/summary",
                                search: { demo: true },
                            })
                        }
                        className="text-spotify-green/70 rounded-md py-1 text-sm font-medium transition-colors hover:text-spotify-green"
                    >
                        Try Demo Mode
                    </button>
                </form>
            </div>

            <div className="relative z-10 mx-3 w-full max-w-5xl pb-16">
                <Explanation />
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
                        <Button
                            onClick={() => navigate({ to: "/upload" })}
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HomePage;

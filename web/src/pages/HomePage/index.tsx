import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { usePingApi } from "@/hooks/usePingAPi";
import { useAuth } from "@/hooks/useAuth";
import Explanation from "@/components/Explanation";
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
            navigate({ to: "/upload" });
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

    return (
        <div className="text-spotify-black flex min-h-screen w-full flex-col items-center bg-linear-to-b from-neutral-50 to-neutral-100 transition dark:from-neutral-900 dark:to-black dark:text-white">
            <div className="mx-2 w-full max-w-md pt-16">
                <h1 className="text-spotify-green mb-2 text-center text-4xl font-bold">
                    ReWrapped
                </h1>
                <p className="mb-8 text-center text-neutral-500 dark:text-neutral-400">
                    Your Spotify listening history, visualized.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="page-section flex flex-col gap-4 rounded-lg p-6 shadow-md"
                >
                    <h2 className="text-center text-2xl font-semibold">
                        {mode === "login" ? "Log In" : "Create Account"}
                    </h2>

                    {mode === "register" && (
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="displayName"
                                className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
                            >
                                Display Name{" "}
                                <span className="text-neutral-400">
                                    (optional)
                                </span>
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-spotify-green dark:border-neutral-600 dark:bg-neutral-800"
                                disabled={isPending}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
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
                            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-spotify-green dark:border-neutral-600 dark:bg-neutral-800"
                            disabled={isPending}
                            autoComplete="email"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
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
                            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-spotify-green dark:border-neutral-600 dark:bg-neutral-800"
                            disabled={isPending}
                            autoComplete={
                                mode === "login"
                                    ? "current-password"
                                    : "new-password"
                            }
                        />
                    </div>

                    {mode === "register" && (
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
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
                                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-spotify-green dark:border-neutral-600 dark:bg-neutral-800"
                                disabled={isPending}
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    {formError && (
                        <p className="text-sm text-red-500">{formError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-spotify-green text-spotify-black mt-2 rounded-full px-6 py-3 text-lg font-semibold transition hover:scale-[1.02] hover:cursor-pointer disabled:opacity-60 dark:text-white"
                    >
                        {isPending
                            ? "Please wait..."
                            : mode === "login"
                              ? "Log In"
                              : "Create Account"}
                    </button>

                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        {mode === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="text-spotify-green hover:underline"
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
                                    className="text-spotify-green hover:underline"
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
                        className="text-sm text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                        Try Demo Mode
                    </button>
                </form>
            </div>

            <div className="mx-2 w-full max-w-5xl pb-16">
                <Explanation />
            </div>
        </div>
    );
};

export default HomePage;

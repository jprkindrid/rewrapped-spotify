import Explanation from "@/shared-components/Explanation";
import NavBar from "@/shared-components/NavBar";
import FileUploadSection from "./FileUploadSection";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import * as authService from "@/services/auth";

const UploadPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const ranOnce = useRef(false);

    const exchangeMutation = useMutation({
        mutationFn: authService.exchangeAuthCode,
        onSuccess: (data) => {
            login(data.token);
            window.history.replaceState({}, "", "/upload");
        },
        onError: (err) => {
            console.error("[Exchange Error]", err);
            navigate({ to: "/" });
        },
    });

    const handleExchange = useCallback(
        (code: string) => {
            if (exchangeMutation.isPending || exchangeMutation.isSuccess)
                return;
            exchangeMutation.mutate(code);
        },
        [exchangeMutation]
    );

    useEffect(() => {
        if (ranOnce.current) return;
        ranOnce.current = true;

        const url = new URL(window.location.href);
        const authCode = url.searchParams.get("auth_code");

        if (!authCode) {
            navigate({ to: "/" });
        }

        handleExchange(authCode!);
    }, [handleExchange, navigate]);

    return (
        <div className="flex flex-col">
            <NavBar includeUser={true} />
            <div className="dark:bg-spotify-black text-spotify-black flex w-full justify-center pt-4 transition dark:text-white">
                <div className="mx-2 h-screen w-full max-w-5xl">
                    <section className="flex flex-col items-center rounded-xl border-2 border-stone-500/10 text-center shadow-md dark:border-white/20">
                        <h2 className="pt-4 text-3xl font-bold">
                            Upload Your Streaming History
                        </h2>
                        <div className="bg-spotify-green my-4 h-px w-[calc(100%-4rem)]"></div>
                        <div className="mb-2 max-w-2xl text-stone-500 dark:text-stone-300">
                            Upload your streaming history JSON files, or entire
                            .zip file to get started! Choose your files and then
                            analyze the data!
                        </div>
                        <FileUploadSection />
                    </section>
                    <Explanation />
                </div>
            </div>
        </div>
    );
};
export default UploadPage;

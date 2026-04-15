import Explanation from "@/components/Explanation";
import NavBar from "@/components/NavBar";
import FileUploadSection from "./FileUploadSection";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const UploadPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            navigate({ to: "/" });
        }
    }, [token, navigate]);

    return (
        <div className="flex flex-col">
            <NavBar includeUser={true} />
            <div className="flex w-full justify-center bg-background pt-8 transition">
                <div className="mx-3 w-full max-w-5xl pb-16">
                    <section className="page-section flex flex-col items-center rounded-xl text-center">
                        <h2 className="pt-6 text-2xl font-bold">
                            Upload Your Streaming History
                        </h2>
                        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                            Upload your streaming history JSON files or a .zip
                            file to get started. Choose your files and then
                            analyze the data.
                        </p>
                        <div className="my-6 h-px w-4/5 max-w-md bg-border/60" />
                        <FileUploadSection />
                    </section>
                    <Explanation />
                </div>
            </div>
        </div>
    );
};
export default UploadPage;

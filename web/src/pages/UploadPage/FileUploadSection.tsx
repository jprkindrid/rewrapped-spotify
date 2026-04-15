import { apiFetch } from "@/services/apiFetch";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const FileUploadSection = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { token } = useAuth();

    const uploadMutation = useMutation({
        mutationFn: async (files: FileList) => {
            if (!files) throw new Error("No files selected");

            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append("files", file));

            const res = await apiFetch("POST", "/api/upload", token!, {
                body: formData,
            });
            if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
            return res.json();
        },
    });

    const handleUpload = async () => {
        if (!files?.length) return;
        try {
            await uploadMutation.mutateAsync(files);
            setFiles(null);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const fileNames =
        files?.length && files.length > 0
            ? Array.from(files)
                  .map((f) => f.name)
                  .join(", ")
            : "No files selected";

    const isError = uploadMutation.isError;
    const isSuccess = uploadMutation.isSuccess;
    const isLoading = uploadMutation.isPending;
    const message =
        (isError && (uploadMutation.error as Error)?.message) ||
        (isSuccess && (
            <div>
                Upload successful! <br /> Head to <strong>Analyze</strong> for
                results
            </div>
        )) ||
        "";

    return (
        <div className="flex w-full flex-col items-center justify-center px-4 py-2 pb-6">
            <input
                id="fileInput"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json,.zip,*/*"
                onChange={(e) => {
                    uploadMutation.reset();
                    setFiles(e.target.files);
                }}
                className="hidden"
            />

            {/* Drop zone hint */}
            <div
                className={clsx(
                    "relative mb-4 w-full max-w-sm overflow-clip rounded-lg border-2 border-dashed px-4 py-3 transition-colors",
                    {
                        "border-destructive/50 bg-destructive/5": isError,
                        "border-spotify-green/50 bg-spotify-green/5": isSuccess,
                        "border-border hover:border-spotify-green/40":
                            !isError && !isSuccess,
                    }
                )}
            >
                <div className="text-xs font-medium text-muted-foreground">
                    Files selected
                </div>
                <div className="mt-0.5 truncate text-sm">
                    {fileNames}
                </div>

                {message && (
                    <div
                        className={clsx(
                            "absolute inset-0 flex items-center justify-center px-4 text-center text-sm font-semibold backdrop-blur-sm",
                            {
                                "bg-destructive/10 text-destructive": isError,
                                "bg-spotify-green/10 text-spotify-green":
                                    isSuccess,
                            }
                        )}
                    >
                        {message}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                >
                    {isLoading ? "..." : "Choose Files"}
                </Button>

                <Button
                    onClick={handleUpload}
                    disabled={!files?.length || isLoading}
                    className="bg-spotify-green hover:bg-spotify-green/90 text-black"
                >
                    {isLoading ? "Uploading..." : "Analyze Data"}
                </Button>
            </div>
        </div>
    );
};

export default FileUploadSection;

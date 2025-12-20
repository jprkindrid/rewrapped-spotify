import { apiFetch } from "@/services/apiFetch";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const FileUploadSection = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { token: token } = useAuth();

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
                'Upload successful! <br /> Head to <strong>"Analyze"</strong>{" "}
                for results'
            </div>
        )) ||
        "";

    return (
        <div className="flex w-full flex-col items-center justify-center py-2">
            <div className="mb-4 flex items-center justify-center">
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

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-spotify-green hover:bg-spotify-green/90 mx-2 text-black"
                >
                    {isLoading ? "..." : "Choose Files"}
                </Button>

                <Button
                    onClick={handleUpload}
                    disabled={!files?.length || isLoading}
                    className="bg-spotify-green hover:bg-spotify-green/90 mx-2 text-black"
                >
                    {isLoading ? "Uploading..." : "Analyze Data"}
                </Button>
            </div>

            <div
                className={clsx(
                    "relative mx-2 my-4 w-1/3 min-w-88 overflow-clip rounded-md border px-3 py-2 transition-colors duration-200",
                    {
                        "border-red-300 bg-red-100 text-red-800": isError,
                        "border-green-300 bg-green-100 text-green-800":
                            isSuccess,
                        "bg-gray-50 text-neutral-700 dark:bg-transparent":
                            !isError && !isSuccess,
                    }
                )}
            >
                <div className="font-bold text-neutral-500">
                    File(s) Selected:
                </div>
                <div className="truncate text-neutral-400 dark:text-neutral-600">
                    {fileNames}
                </div>

                {message && (
                    <div
                        className={clsx(
                            "bg-opacity-80 absolute inset-0 flex items-center justify-center font-semibold backdrop-blur-sm",
                            {
                                "bg-red-100/90 text-red-800": isError,
                                "bg-green-100/90 text-green-800": isSuccess,
                            }
                        )}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploadSection;

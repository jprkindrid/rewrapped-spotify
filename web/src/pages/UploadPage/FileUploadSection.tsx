import { apiFetch } from "@/services/apiFetch";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import clsx from "clsx";

const FileUploadSection = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const uploadMutation = useMutation({
        mutationFn: async (files: FileList) => {
            if (!files) throw new Error("No files selected");

            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append("files", file));

            const res = await apiFetch("POST", "/api/upload", {
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

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-spotify-green text-spotify-black mx-2 w-34 rounded-md px-4 py-2 font-bold hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-900 dark:text-white"
                >
                    {isLoading ? "..." : "Choose Files"}
                </button>

                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!files?.length || isLoading}
                    className="bg-spotify-green text-spotify-black mx-2 w-34 rounded-md px-4 py-2 font-bold hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-900 dark:text-white"
                >
                    {isLoading ? "Uploading..." : "Analyze Data"}
                </button>
            </div>

            <div
                className={clsx(
                    "relative mx-2 my-4 w-1/3 min-w-[22rem] overflow-clip rounded-md border px-3 py-2 transition-colors duration-200",
                    {
                        "border-red-300 bg-red-100 text-red-800": isError,
                        "border-green-300 bg-green-100 text-green-800":
                            isSuccess,
                        "bg-gray-50 text-stone-700 dark:bg-transparent":
                            !isError && !isSuccess,
                    }
                )}
            >
                <div className="font-bold text-stone-500">
                    File(s) Selected:
                </div>
                <div className="truncate text-stone-400 dark:text-stone-600">
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

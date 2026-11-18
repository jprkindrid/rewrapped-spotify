import { defineConfig } from "vite";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        ...(isDev ? [] : [babel({ presets: [reactCompilerPreset()] })]),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    server: {
        host: "127.0.0.1",
        port: 5173,
        proxy: {
            "^/(api|auth)": {
                target: "http://127.0.0.1:8080",
                changeOrigin: true,
                cookieDomainRewrite: "127.0.0.1",
            },
        },
    },
});

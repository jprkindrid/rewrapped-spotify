import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: isDev ? [] : ["babel-plugin-react-compiler"],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
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

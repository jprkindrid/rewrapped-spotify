declare module "*.css" {
    const content: string;
    export default content;
}

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_SPOTIFY_AUTH_URL: string;
    readonly VITE_SPOTIFY_CALLBACK_URL: string;
    readonly VITE_DEMO_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

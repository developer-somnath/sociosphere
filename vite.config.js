import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        cors: {
            origin: "http://10.204.225.133:8000",
            credentials: true,
        },
        hmr: {
            host: "10.204.225.133",
            protocol: "ws",
            port: 5173,
        },
    },

    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.tsx",
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
});
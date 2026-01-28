import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
                // Add additional entry points (for example, an admin bundle) if needed:
                // 'resources/js/admin.jsx',
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            // Uncomment if you truly need to rely on the local react-router-dom shim:
            'react-router-dom': fileURLToPath(
                new URL('./resources/js/lib/react-router-dom.jsx', import.meta.url)
            ),
        },
    },

    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'assessment.local', // Match the domain opened in the browser
            protocol: 'ws',
            port: 5173,
        },
    },
});

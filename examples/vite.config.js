import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    // Relative base so the built app also works from a file:// Cordova WebView.
    base: './',
    plugins: [react()],
    server: {
        port: 3000
    },
    build: {
        outDir: 'build'
    },
    test: {
        environment: 'jsdom',
        globals: true
    }
});

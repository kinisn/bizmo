/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            bizmo: path.resolve(__dirname, 'src/bizmo'),
            bizmoView: path.resolve(__dirname, 'src/bizmoView'),
            globalState: path.resolve(__dirname, 'src/globalState'),
            i18n: path.resolve(__dirname, 'src/i18n'),
        },
    },
    server: {
        port: 5173,
    },
    plugins: [react()],
    test: {
        globals: true,
        poolMatchGlobs: [
            ['**/src/bizmo/**', 'typescript'],
            ['**/src/bizmoView/**', 'browser'],
        ],
    },
});

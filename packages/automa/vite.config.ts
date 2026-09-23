import { defineStylexApp } from '@repo/internal-config/vite-app';
import { defineConfig } from 'vite-plus';

// https://vite.dev/config/
export default defineConfig({
    ...defineStylexApp(),
});

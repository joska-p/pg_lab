import { defineConfig } from 'vite-plus';

// @repo/internal-config ships raw .ts consumed at config load (jiti), never
// bundled or published: no Vite transform plugins, no pack block here.
// lint/fmt: owned by the root config (global options + overrides).
export default defineConfig({});

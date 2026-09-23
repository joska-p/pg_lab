import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { lazyPlugins } from 'vite-plus';
import type { ViteUserConfig } from 'vite-plus';

// Shared wiring for the React pack-libs (glaze, glaze3d): babel React
// Compiler + react plugins, react dedupe and monorepo fs allowlist.
// Pack `entry` and `test` blocks stay per-package (different entries).
// `lazyPlugins` semantics preserved (see vite-app.ts).
export function defineReactLib(): ViteUserConfig {
    return {
        // lint: owned by the root config `lint.overrides`.
        plugins: lazyPlugins(() => [
            babel({
                presets: [reactCompilerPreset()],
            }),
            react(),
        ]),
        resolve: {
            dedupe: ['react', 'react-dom'],
        },
        server: {
            fs: {
                allow: ['../..'],
            },
        },
    };
}

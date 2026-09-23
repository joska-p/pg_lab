import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';
import { lazyPlugins } from 'vite-plus';

// https://vite.dev/config/
export default defineConfig({
    pack: {
        // One entry per public subpath (see package.json exports).
        // exports: false: the dual source/dist map below is hand-written.
        entry: [
            './src/core/index.ts',
            './src/geometry/index.ts',
            './src/material/index.ts',
            './src/math/index.ts',
            './src/renderer/index.ts',
            './src/controls/index.ts',
        ],
        dts: {
            generator: 'tsgo',
        },
        exports: false,
    },
    test: {
        include: ['src/**/*.test.ts'],
    },
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
});

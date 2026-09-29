import { stylexPreset } from '@repo/ui/presets';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import stylexPlugin from 'unplugin-stylex/vite';
import { defineConfig } from 'vite-plus';
import { lazyPlugins } from 'vite-plus';

export default defineConfig({
    plugins: lazyPlugins(() => [
        stylexPlugin(stylexPreset),
        babel({
            presets: [reactCompilerPreset()],
        }),
        react(),
    ]),
});

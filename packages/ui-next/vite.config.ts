import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import stylexVitePlugin from 'unplugin-stylex/vite';
import { defineConfig } from 'vite-plus';
import { lazyPlugins } from 'vite-plus';

export default defineConfig({
    plugins: lazyPlugins(() => [
        stylexVitePlugin({
            dev: true,
            stylex: {
                useCSSLayers: true,
                genConditionalClasses: true,
                treeshakeCompensation: true,
            },
        }),
        babel({
            presets: [reactCompilerPreset()],
        }),
        react(),
    ]),
});

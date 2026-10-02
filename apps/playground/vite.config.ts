import babel from '@rolldown/plugin-babel';
import stylex from '@stylexjs/unplugin';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { Features } from 'lightningcss';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
    base: '/pg_lab/',
    plugins: lazyPlugins(() => [
        stylex.vite({
            dev: true,
            useCSSLayers: true,
            lightningcssOptions: {
                exclude: Features.LightDark,
            },
        }),
        babel({
            presets: [reactCompilerPreset()],
        }),
        react(),
    ]),
});

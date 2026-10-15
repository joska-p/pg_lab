import babel from '@rolldown/plugin-babel';
import stylex from '@stylexjs/unplugin';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { Features } from 'lightningcss';
import { lazyPlugins } from 'vite-plus';

interface ReactPluginsOptions {
    /** Enable the StyleX unplugin. Disable for packages without StyleX. */
    stylex?: boolean;
}

/**
 * Shared Vite plugin stack for React packages.
 *
 * Keeps the StyleX + React + React Compiler setup in one place instead of duplicating it across
 * every package `vite.config.ts`.
 */
export function reactPlugins({ stylex: withStylex = true }: ReactPluginsOptions = {}) {
    return lazyPlugins(() => [
        ...(withStylex
            ? [
                  stylex.vite({
                      dev: true,
                      useCSSLayers: true,
                      lightningcssOptions: {
                          exclude: Features.LightDark,
                      },
                  }),
              ]
            : []),
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
    ]);
}

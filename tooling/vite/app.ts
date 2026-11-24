import stylex from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { Features } from 'lightningcss';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { configDefaults } from 'vite-plus/test/config';

/**
 * Shared app preset, imported by every app `vite.config.ts`.
 *
 * Vite resolves its config from the app directory, so each app still owns a small local config; it
 * only delegates the shared stack to `defineAppConfig`.
 */

/**
 * Vitest settings shared by the workspace root and by packages that run their own test command (for
 * example `randomart`'s `test:measure`).
 */
export const testConfig = {
    exclude: [...configDefaults.exclude, '.devcontainer_home/**'],
    isolate: false,
    fsModuleCache: true,
};

/** Vite settings shared by every app. */
export const sharedViteConfig = {
    resolve: {
        conditions: ['source', 'module', 'browser', 'development|production'],
    },
    test: testConfig,
};

interface ReactPluginsOptions {
    /** Enable the StyleX unplugin. Disable for packages without StyleX. */
    stylex?: boolean;
}

/**
 * Shared Vite plugin stack for React apps.
 *
 * React Compiler runs through Oxc (`react({ compiler: true })`), not Babel.
 */
export function reactPlugins({ stylex: withStylex = true }: ReactPluginsOptions = {}) {
    return lazyPlugins(() => [
        ...(withStylex
            ? [
                  stylex({
                      dev: true,
                      useCSSLayers: true,
                      lightningcssOptions: {
                          exclude: Features.LightDark,
                      },
                  }),
              ]
            : []),
        react({ compiler: true }),
    ]);
}

interface AppConfigOptions {
    /** Public base path for the app. */
    base?: string;
    /** Enable the StyleX unplugin. Defaults to true. */
    stylex?: boolean;
}

/**
 * Build a Vite config for one app.
 *
 * Each app still owns a `vite.config.ts` because Vite resolves its config from the app directory;
 * this helper keeps the shared stack in one place.
 */
export function defineAppConfig({ stylex: withStylex = true, ...config }: AppConfigOptions = {}) {
    return defineConfig({
        ...sharedViteConfig,
        ...config,
        plugins: reactPlugins({ stylex: withStylex }),
    });
}

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import stylexPlugin from 'unplugin-stylex/vite';
import { lazyPlugins } from 'vite-plus';
import type { ViteUserConfig } from 'vite-plus';

import { stylexPreset } from './stylex-preset.ts';

export interface StylexAppOptions {
    base?: string;
    test?: ViteUserConfig['test'];
}

// Shared wiring for the 7 StyleX apps (brouillon, playground, art-canvas,
// automa, fracture, mol-demo, mosaic-maker). Identical plugins (StyleX +
// babel React Compiler + react), resolve, optimizeDeps and server blocks.
// React 19 note: `react()` + `reactCompilerPreset()` is the repo standard;
// StyleX still needs the babel transform, no legacy Babel config involved.
// `lazyPlugins` semantics preserved: the factory is skipped when vite-plus
// loads the config only to read a metadata block (lint/fmt/check/pack).
export function defineStylexApp(options: StylexAppOptions = {}): ViteUserConfig {
    const { base, test } = options;
    return {
        ...(base === undefined ? {} : { base }),
        ...(test === undefined ? {} : { test }),
        // lint: owned by the root config `lint.overrides`.
        plugins: lazyPlugins(() => [
            stylexPlugin(stylexPreset),
            babel({
                presets: [reactCompilerPreset()],
            }),
            react(),
        ]),
        resolve: {
            // Internal runs use workspace sources (see tsconfig.base.json
            // customConditions); externals fall through to compiled dist.
            conditions: ['source', 'module', 'browser', 'development|production'],
            dedupe: ['@stylexjs/stylex', 'react', 'react-dom'],
        },
        optimizeDeps: {
            exclude: ['@repo/ui'],
        },
        server: {
            fs: {
                allow: ['../..'],
            },
        },
    };
}

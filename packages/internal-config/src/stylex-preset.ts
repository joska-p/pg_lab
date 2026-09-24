import { fileURLToPath } from 'node:url';

import type { UnpluginStylexOptions } from 'unplugin-stylex/types';

// Single source of truth for StyleX compilation across the monorepo.
// Consuming apps spread this preset into unplugin-stylex so classnames,
// layers and CSS output stay deterministic. @repo/ui ships source, each
// app compiles it with these exact options.
export const stylexPreset = {
    stylex: {
        useCSSLayers: true,
        // unplugin-stylex resolves *.stylex theme files with Node's default
        // conditions (node/import), which map @repo/ui/* onto dist/ via the
        // "import" export condition. dist is gitignored and absent on a fresh
        // CI checkout, so force theme resolution onto the workspace sources.
        aliases: {
            '@repo/ui/*': [fileURLToPath(new URL('../../ui/src/*', import.meta.url))],
        },
    },
} satisfies UnpluginStylexOptions;

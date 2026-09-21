import type { UnpluginStylexOptions } from 'unplugin-stylex/types';

// Single source of truth for StyleX compilation across the monorepo.
// Consuming apps spread this preset into unplugin-stylex so classnames,
// layers and CSS output stay deterministic. @repo/ui ships source, each
// app compiles it with these exact options.
export const stylexPreset = {
    stylex: {
        useCSSLayers: true,
    },
} satisfies UnpluginStylexOptions;

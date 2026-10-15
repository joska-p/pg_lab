import type { OxlintOverride } from 'vite-plus/lint';

/**
 * Node environment for tooling and Node-only packages.
 *
 * Applied via a `files` override in the root `vite.config.ts`.
 */
export const nodeLint = {
    env: {
        node: true,
    },
} satisfies Omit<OxlintOverride, 'files'>;

import { createTemplate } from 'bingo';
import { z } from 'zod';

import pkgJson from '../package.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function labelFrom(name: string): string {
    return name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function manifest(name: string): string {
    const label = labelFrom(name);

    return `import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: '${label}',
    summary: 'TODO: describe this Experiment.',
    tint: 'purple',
    mark: '${name}',
} satisfies ExperimentMetadata;
`;
}

function scene(name: string): string {
    const label = labelFrom(name);

    return `export function Scene() {
    return <p>Scene for ${label}.</p>;
}
`;
}

const controls = `export function Controls() {
    return null;
}
`;

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

export default createTemplate({
    about: {
        name: pkgJson.name,
        description: pkgJson.description,
    },

    options: {
        name: z
            .string()
            .regex(/^[a-z][a-z0-9-]*$/, 'Must be kebab-case (e.g. my-experiment)')
            .describe('Experiment folder id (kebab-case)'),
    },

    async produce({ options }) {
        const { name } = options;

        return {
            files: {
                apps: {
                    playground: {
                        src: {
                            experiments: {
                                [name]: {
                                    'manifest.ts': manifest(name),
                                    'Scene.tsx': scene(name),
                                    'Controls.tsx': controls,
                                },
                            },
                        },
                    },
                },
            },
            suggestions: [`Edit apps/playground/src/experiments/${name}`, 'vp dev'],
        };
    },
});

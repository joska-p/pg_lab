import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: 'Randomart',
    summary:
        'Generative art synthesis converting recursive mathematical ASTs into live GLSL fragment shaders.',
    tint: 'orange',
    mark: 'randomart',
} satisfies ExperimentMetadata;

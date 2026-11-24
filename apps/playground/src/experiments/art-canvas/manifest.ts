import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: 'Art Canvas',
    summary:
        'GPU shader workshop container with live fragment compilation and parametric raymarching.',
    tint: 'aurora',
    mark: 'art-canvas',
    stageLabel: 'art-canvas',
} satisfies ExperimentMetadata;

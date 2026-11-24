import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: 'Palette Generator',
    summary:
        'Perceptual color palette designer and harmonic palette generator calculated in OKLCH space.',
    tint: 'aurora',
    mark: 'palette',
    stageLabel: 'Palette generator',
} satisfies ExperimentMetadata;

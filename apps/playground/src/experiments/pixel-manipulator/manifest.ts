import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: 'Pixel Manipulator',
    summary:
        'Multi-pass image convolution laboratory featuring custom kernels, matrix filters, and dithering.',
    tint: 'amber',
    mark: 'pixel-manipulator',
    stageLabel: 'Pixel manipulator',
} satisfies ExperimentMetadata;

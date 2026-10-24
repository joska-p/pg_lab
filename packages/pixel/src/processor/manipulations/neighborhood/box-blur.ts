import { defineManip } from '../../manipulation-factories';
import { applyKernel } from './helpers';

export const boxBlur = defineManip<{ radius?: number }>({
    access: 'neighborhood',
    id: 'box-blur',
    radius: 1,
    execute: ({ options, source, destination, width, height }) => {
        const radius = options.radius ?? 1;
        const size = radius * 2 + 1;

        applyKernel(
            source,
            destination,
            width,
            height,
            new Array<number>(size * size).fill(1),
            size,
            size * size,
        );
    },
    ui: {
        name: 'Box Blur',
        description: 'Applies a uniform box blur.',
        longDescription:
            'Convolves the image with a uniform kernel where all weights are equal. Faster than Gaussian for large radii. Kernel size = radius × 2 + 1.',
        defaultArgs: { radius: 1 },
        argDefinitions: [{ key: 'radius', label: 'Radius', min: 1, max: 10, step: 1 }],
    },
});

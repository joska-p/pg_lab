import { defineManip } from '../../manipulation-factories';
import { applyKernel } from './helpers';

export const sharpen = defineManip<{ strength?: number }>({
    access: 'neighborhood',
    id: 'sharpen',
    radius: 1,
    execute: ({ options, source, destination, width, height }) => {
        const strength = options.strength ?? 1;
        const kernel = [0, -strength, 0, -strength, 1 + 4 * strength, -strength, 0, -strength, 0];

        applyKernel(source, destination, width, height, kernel, 3, 1);
    },
    ui: {
        name: 'Sharpen',
        description: 'Sharpens the image using a Laplacian-like kernel.',
        longDescription:
            'Laplacian unsharp mask. Kernel: [0, −s, 0, −s, 1+4s, −s, 0, −s, 0]. The center pixel is amplified relative to its neighbors, enhancing edges.',
        defaultArgs: { strength: 1 },
        argDefinitions: [{ key: 'strength', label: 'Strength', min: 0, max: 5, step: 0.1 }],
    },
});

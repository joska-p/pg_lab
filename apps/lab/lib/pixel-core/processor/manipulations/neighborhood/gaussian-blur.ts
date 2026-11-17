import { defineManip } from '../../manipulation-factories';
import { applyKernel } from './helpers';

export const gaussianBlur = defineManip<{ radius?: number }>({
    access: 'neighborhood',
    id: 'gaussian-blur',
    radius: 1,
    execute: ({ options, source, destination, width, height }) => {
        const radius = options.radius ?? 1;
        const size = radius * 2 + 1;
        const sigma = radius / 2 + 0.5;
        const kernel: number[] = [];
        let total = 0;

        for (let ky = 0; ky < size; ky++) {
            for (let kx = 0; kx < size; kx++) {
                const dx = kx - radius;
                const dy = ky - radius;
                const v = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));

                kernel.push(v);
                total += v;
            }
        }

        applyKernel(source, destination, width, height, kernel, size, total);
    },
    ui: {
        name: 'Gaussian Blur',
        description: 'Applies a gaussian blur.',
        longDescription:
            'Convolves the image with a Gaussian kernel. Kernel size = radius × 2 + 1, sigma = radius / 2 + 0.5. The kernel weights follow a Gaussian distribution centered on the pixel.',
        defaultArgs: { radius: 1 },
        argDefinitions: [{ key: 'radius', label: 'Radius', min: 1, max: 10, step: 1 }],
    },
});

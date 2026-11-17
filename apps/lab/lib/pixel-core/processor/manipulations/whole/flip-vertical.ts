import { defineManip } from '../../manipulation-factories';

export const flipVertical = defineManip({
    id: 'flip-vertical',
    access: 'neighborhood',
    radius: 0,
    execute: ({ source, destination, width, height }) => {
        for (let y = 0; y < height; y++) {
            destination.set(
                source.subarray(y * width * 4, (y + 1) * width * 4),
                (height - 1 - y) * width * 4,
            );
        }
    },
    ui: {
        name: 'Flip Vertical',
        description: 'Mirrors the image top-to-bottom.',
        longDescription:
            'Mirrors the image vertically by reversing row order. Pixel at (x, y) moves to (x, height − 1 − y).',
        defaultArgs: {},
        argDefinitions: [],
    },
});

import { defineManip } from '../../manipulation-factories';

export const flipHorizontal = defineManip({
    id: 'flip-horizontal',
    access: 'neighborhood',
    radius: 0,
    execute: ({ source, destination, width, height }) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const si = (y * width + x) * 4;
                const di = (y * width + (width - 1 - x)) * 4;

                destination[di] = source[si] ?? 0;
                destination[di + 1] = source[si + 1] ?? 0;
                destination[di + 2] = source[si + 2] ?? 0;
                destination[di + 3] = source[si + 3] ?? 255;
            }
        }
    },
    ui: {
        name: 'Flip Horizontal',
        description: 'Mirrors the image left-to-right.',
        longDescription:
            'Mirrors the image horizontally by reversing pixel order within each row. Pixel at (x, y) moves to (width − 1 − x, y).',
        defaultArgs: {},
        argDefinitions: [],
    },
});

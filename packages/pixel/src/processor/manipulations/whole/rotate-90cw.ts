import { defineManip } from '../../manipulation-factories';
import { PixelData } from '../../pixel-data';

export const rotate90Cw = defineManip({
    access: 'global',
    id: 'rotate-90cw',
    execute: ({ imageData }) => {
        const { width, height, data } = imageData;
        const out = new PixelData(height, width);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const source = (y * width + x) * 4;
                const destinationIndex = (x * height + (height - 1 - y)) * 4;

                out.data[destinationIndex] = data[source] ?? 0;
                out.data[destinationIndex + 1] = data[source + 1] ?? 0;
                out.data[destinationIndex + 2] = data[source + 2] ?? 0;
                out.data[destinationIndex + 3] = data[source + 3] ?? 255;
            }
        }

        return out;
    },
    ui: {
        name: 'Rotate 90° CW',
        description: 'Rotates the image 90 degrees clockwise.',
        longDescription:
            'Rotates the image 90 degrees clockwise. The output dimensions swap: output width = input height, output height = input width. Pixel at (x, y) maps to (height − 1 − y, x).',
        defaultArgs: {},
        argDefinitions: [],
    },
});

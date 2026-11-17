import { defineManip } from '../../manipulation-factories';

export const grayscale = defineManip({
    access: 'pixel',
    id: 'grayscale',
    execute: ({ red, green, blue, alpha }) => {
        const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;

        return [luminance, luminance, luminance, alpha];
    },
    ui: {
        name: 'Grayscale',
        description: 'Converts the image to grayscale using luminance weighting.',
        longDescription:
            'Converts to luminance using ITU-R BT.601 weights: L = 0.2126R + 0.7152G + 0.0722B. Each channel is set to the luminance value, preserving perceived brightness.',
        defaultArgs: {},
        argDefinitions: [],
    },
});

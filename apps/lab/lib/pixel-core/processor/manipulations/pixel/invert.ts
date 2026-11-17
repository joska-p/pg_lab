import { defineManip } from '../../manipulation-factories';

export const invert = defineManip({
    access: 'pixel',
    id: 'invert',
    execute: ({ red, green, blue, alpha }) => [255 - red, 255 - green, 255 - blue, alpha],
    ui: {
        name: 'Invert',
        description: 'Inverts all color channels.',
        longDescription:
            'Inverts each channel independently: output = 255 − input. Alpha is preserved unchanged.',
        defaultArgs: {},
        argDefinitions: [],
    },
});

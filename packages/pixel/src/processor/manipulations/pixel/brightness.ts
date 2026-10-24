import { defineManip } from '../../manipulation-factories';

export const brightness = defineManip<{ value?: number }>({
    access: 'pixel',
    id: 'brightness',
    execute: ({ options, red, green, blue, alpha }) => {
        const value = options.value ?? 1;

        return [red * value, green * value, blue * value, alpha];
    },
    ui: {
        name: 'Brightness',
        description: 'Adjusts brightness by a factor.',
        longDescription:
            'Multiplies each RGB channel by `value`. Each output channel = input × value. A value of 1 leaves the image unchanged, 2 doubles brightness, and 0.5 halves it.',
        defaultArgs: { value: 1 },
        argDefinitions: [{ key: 'value', label: 'Value', min: 0, max: 3, step: 0.1 }],
    },
});

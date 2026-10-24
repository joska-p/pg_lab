import { defineManip } from '../../manipulation-factories';

export const opacity = defineManip<{ value?: number }>({
    access: 'pixel',
    id: 'opacity',
    execute: ({ options, red, green, blue, alpha }) => {
        const value = options.value ?? 1;

        return [red, green, blue, alpha * value];
    },
    ui: {
        name: 'Opacity',
        description: 'Adjusts the opacity (alpha channel).',
        longDescription:
            'Multiplies the alpha channel by the given value. A value of 1 preserves full opacity, 0 makes the image fully transparent.',
        defaultArgs: { value: 1 },
        argDefinitions: [{ key: 'value', label: 'Value', min: 0, max: 1, step: 0.05 }],
    },
});

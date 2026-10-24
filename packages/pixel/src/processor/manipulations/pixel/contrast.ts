import { defineManip } from '../../manipulation-factories';

export const contrast = defineManip<{ value?: number }>({
    access: 'pixel',
    id: 'contrast',
    execute: ({ options, red, green, blue, alpha }) => {
        const value = options.value ?? 1;

        return [
            (red - 128) * value + 128,
            (green - 128) * value + 128,
            (blue - 128) * value + 128,
            alpha,
        ];
    },
    ui: {
        name: 'Contrast',
        description: 'Adjusts contrast by a factor.',
        longDescription:
            'Scales each channel relative to 128 (mid-gray). output = (input − 128) × value + 128. A value of 1 leaves the image unchanged; values above 1 increase contrast.',
        defaultArgs: { value: 1 },
        argDefinitions: [{ key: 'value', label: 'Value', min: 0, max: 3, step: 0.1 }],
    },
});

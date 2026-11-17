import { defineManip } from '../../manipulation-factories';

export const saturation = defineManip<{ value?: number }>({
    access: 'pixel',
    id: 'saturation',
    execute: ({ options, red, green, blue, alpha }) => {
        const value = options.value ?? 1;
        const l = red * 0.2126 + green * 0.7152 + blue * 0.0722;

        return [l + (red - l) * value, l + (green - l) * value, l + (blue - l) * value, alpha];
    },
    ui: {
        name: 'Saturation',
        description: 'Adjusts color saturation by a factor.',
        longDescription:
            "Scales each channel's deviation from luminance. For each channel: output = L + (input − L) × value. 0 produces grayscale, 1 is unchanged, values above 1 oversaturate.",
        defaultArgs: { value: 1 },
        argDefinitions: [{ key: 'value', label: 'Value', min: 0, max: 3, step: 0.1 }],
    },
});

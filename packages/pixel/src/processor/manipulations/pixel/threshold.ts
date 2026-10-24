import { defineManip } from '../../manipulation-factories';

export const threshold = defineManip<{ threshold?: number }>({
    access: 'pixel',
    id: 'threshold',
    execute: ({ options, red, green, blue, alpha }) => {
        const threshold = options.threshold ?? 128;
        const l = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        const v = l >= threshold ? 255 : 0;

        return [v, v, v, alpha];
    },
    ui: {
        name: 'Threshold',
        description: 'Applies a binary black/white threshold based on luminance.',
        longDescription:
            'Converts each pixel to pure black or white by comparing luminance against the threshold. Luminance uses BT.601 weights. Pixels below the threshold become black, above become white.',
        defaultArgs: { threshold: 128 },
        argDefinitions: [{ key: 'threshold', label: 'Threshold', min: 0, max: 255, step: 1 }],
    },
});

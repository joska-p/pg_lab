import { defineManip } from '../../manipulation-factories';

export const hueRotate = defineManip<{ degrees?: number }>({
    access: 'pixel',
    id: 'hue-rotate',
    execute: ({ options, red, green, blue, alpha }) => {
        const degrees = options.degrees ?? 0;
        const angle = (degrees * Math.PI) / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const s3 = Math.sqrt(1 / 3);
        const base = (1 - cosA) / 3;
        const newRed = red * (cosA + base) + green * (base - s3 * sinA) + blue * (base + s3 * sinA);
        const newGreen =
            red * (base + s3 * sinA) + green * (cosA + base) + blue * (base - s3 * sinA);
        const newBlue =
            red * (base - s3 * sinA) + green * (base + s3 * sinA) + blue * (cosA + base);

        return [newRed, newGreen, newBlue, alpha];
    },
    ui: {
        name: 'Hue Rotate',
        description: 'Rotates hues by an angle in degrees.',
        longDescription:
            'Rotates hue in a YUV-like color space using a rotation matrix. Each pixel is converted to YUV, the UV vector is rotated by the given angle, then converted back to RGB.',
        defaultArgs: { degrees: 0 },
        argDefinitions: [{ key: 'degrees', label: 'Degrees', min: 0, max: 360, step: 1 }],
    },
});

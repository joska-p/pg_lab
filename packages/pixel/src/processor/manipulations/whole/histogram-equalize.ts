import { defineManip } from '../../manipulation-factories';
import { PixelData } from '../../pixel-data';

export const histogramEqualize = defineManip({
    access: 'global',
    id: 'histogram-equalize',
    execute: ({ imageData }) => {
        const data = imageData.data;
        const n = imageData.width * imageData.height;
        const luminance = new Uint8Array(n);
        const hist = new Uint32Array(256);

        for (let i = 0; i < n; i++) {
            const l = Math.round(
                (data[i * 4] ?? 0) * 0.2126 +
                    (data[i * 4 + 1] ?? 0) * 0.7152 +
                    (data[i * 4 + 2] ?? 0) * 0.0722,
            );

            luminance[i] = l;
            hist[l] = (hist[l] ?? 0) + 1;
        }

        const cdf = new Uint32Array(256);

        cdf[0] = hist[0];

        for (let i = 1; i < 256; i++) {
            cdf[i] = (cdf[i - 1] ?? 0) + (hist[i] ?? 0);
        }

        let cdfMin = 0;

        for (let i = 0; i < 256; i++) {
            if ((cdf[i] ?? 0) > 0) {
                cdfMin = cdf[i] ?? 0;
                break;
            }
        }

        const lut = new Uint8ClampedArray(256);

        for (let i = 0; i < 256; i++) {
            lut[i] = Math.round((((cdf[i] ?? 0) - cdfMin) / (n - cdfMin)) * 255);
        }

        const out = new PixelData(imageData.width, imageData.height);

        for (let i = 0; i < n; i++) {
            const off = i * 4;
            const red = data[off] ?? 0;
            const green = data[off + 1] ?? 0;
            const blue = data[off + 2] ?? 0;
            const l = luminance[i] ?? 0;
            const scale = l > 0 ? (lut[l] ?? 0) / l : 1;

            out.data[off] = Math.min(255, Math.round(red * scale));
            out.data[off + 1] = Math.min(255, Math.round(green * scale));
            out.data[off + 2] = Math.min(255, Math.round(blue * scale));
            out.data[off + 3] = data[off + 3] ?? 255;
        }

        return out;
    },
    ui: {
        name: 'Histogram Equalize',
        description: 'Equalizes the luminance histogram for improved contrast.',
        longDescription:
            'Improves contrast by spreading luminance values across the full 0–255 range. Computes the luminance histogram, builds a CDF-based lookup table, and remaps each pixel while preserving per-channel color ratios.',
        defaultArgs: {},
        argDefinitions: [],
    },
});

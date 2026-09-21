// X-ray colormap LUT (256 entries, gamma 0.72 pre-applied, built once).
// Ported from mol-demo.js XRAY_LUT.

type Rgb = [number, number, number];

const STOPS: Array<[number, Rgb]> = [
    [0.0, [3, 4, 18]],
    [0.18, [6, 18, 55]],
    [0.35, [4, 55, 105]],
    [0.5, [0, 105, 155]],
    [0.63, [0, 158, 188]],
    [0.74, [0, 198, 218]],
    [0.84, [45, 228, 235]],
    [0.92, [120, 242, 250]],
    [0.97, [195, 250, 255]],
    [1.0, [255, 255, 255]],
];

export const XRAY_LUT_GAMMA = 0.72;

function buildLut(): Uint8Array {
    const lut = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
        const v = (i / 255) ** XRAY_LUT_GAMMA;
        for (let s = 0; s < STOPS.length - 1; s++) {
            const [t0, c0] = STOPS[s];
            const [t1, c1] = STOPS[s + 1];
            if (v <= t1) {
                const t = (v - t0) / (t1 - t0);
                lut[i * 3] = Math.round(c0[0] + t * (c1[0] - c0[0]));
                lut[i * 3 + 1] = Math.round(c0[1] + t * (c1[1] - c0[1]));
                lut[i * 3 + 2] = Math.round(c0[2] + t * (c1[2] - c0[2]));
                break;
            }
        }
    }
    return lut;
}

export const XRAY_LUT: Uint8Array = buildLut();

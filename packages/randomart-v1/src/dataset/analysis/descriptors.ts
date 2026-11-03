import { flatShareOf } from '../../core/renderer/flatness';
import type { RgbImage } from '../../core/renderer/types';
import { computeMean, computeStd } from '../../core/shared/shared';
import { correlation } from './correlation';

export type { RgbImage } from '../../core/renderer/types';

export type Descriptors = Record<string, number>;

const BAND_COUNT = 4;
const EDGE_THRESHOLD = 0.05;
const HISTOGRAM_BINS = 16;

/** Per-channel planes in [0, 1]. */
function planes(image: RgbImage): [Float32Array, Float32Array, Float32Array] {
    const count = image.width * image.height;
    const r = new Float32Array(count);
    const g = new Float32Array(count);
    const b = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        r[i] = image.rgb[i * 3] / 255;
        g[i] = image.rgb[i * 3 + 1] / 255;
        b[i] = image.rgb[i * 3 + 2] / 255;
    }

    return [r, g, b];
}

function halve(source: Float32Array, width: number, height: number): Float32Array {
    const w = width >> 1;
    const h = height >> 1;
    const out = new Float32Array(w * h);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = 2 * y * width + 2 * x;

            out[y * w + x] =
                (source[i] + source[i + 1] + source[i + width] + source[i + width + 1]) / 4;
        }
    }

    return out;
}

/** Energy per octave: share of the detail (finest first) in the total, so amplitude drops out. */
function spectralShares(luma: Float32Array, width: number, height: number): number[] {
    const energies: number[] = [];
    let level = luma;
    let w = width;
    let h = height;

    for (let band = 0; band < BAND_COUNT; band++) {
        const coarse = halve(level, w, h);
        const cw = w >> 1;
        let energy = 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                energy += (level[y * w + x] - coarse[(y >> 1) * cw + (x >> 1)]) ** 2;
            }
        }

        energies.push(energy / (w * h));
        level = coarse;
        w = cw;
        h = h >> 1;
    }

    const total = energies.reduce((sum, value) => sum + value, 0);

    return energies.map((value) => (total === 0 ? 0 : value / total));
}

function gradientStats(luma: Float32Array, width: number, height: number) {
    let total = 0;
    let strong = 0;
    let edgePixels = 0;
    let count = 0;

    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            const i = y * width + x;
            const magnitude = Math.hypot(luma[i + 1] - luma[i], luma[i + width] - luma[i]);

            total += magnitude;
            count++;

            if (magnitude > EDGE_THRESHOLD) {
                strong += magnitude;
                edgePixels++;
            }
        }
    }

    return {
        meanGradient: total / count,
        edgeDensity: edgePixels / count,
        // Share of the gradient mass carried by strong gradients: 1 = all sharp edges, 0 = all
        // smooth ramps. Independent of how many edges there are.
        edgeSharpness: total === 0 ? 0 : strong / total,
    };
}

/** 1 minus the mean absolute difference with the transformed image: 1 = perfectly symmetric. */
function symmetry(
    luma: Float32Array,
    size: number,
    map: (x: number, y: number) => [number, number],
): number {
    let diff = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const [mx, my] = map(x, y);

            diff += Math.abs(luma[y * size + x] - luma[my * size + mx]);
        }
    }

    return 1 - diff / (size * size);
}

function lumaEntropy(luma: Float32Array): number {
    const bins = new Array<number>(HISTOGRAM_BINS).fill(0);

    for (const value of luma) {
        bins[Math.min(HISTOGRAM_BINS - 1, Math.floor(value * HISTOGRAM_BINS))]++;
    }

    let entropy = 0;

    for (const count of bins) {
        if (count > 0) {
            const p = count / luma.length;

            entropy -= p * Math.log2(p);
        }
    }

    return entropy / Math.log2(HISTOGRAM_BINS);
}

function colorStats(r: Float32Array, g: Float32Array, b: Float32Array) {
    const count = r.length;
    const saturation = new Float32Array(count);
    const rg = new Float32Array(count);
    const yb = new Float32Array(count);
    let hueX = 0;
    let hueY = 0;
    let satSum = 0;

    for (let i = 0; i < count; i++) {
        const high = Math.max(r[i], g[i], b[i]);
        const low = Math.min(r[i], g[i], b[i]);
        const sat = high === 0 ? 0 : (high - low) / high;
        const hue = Math.atan2(Math.sqrt(3) * (g[i] - b[i]), 2 * r[i] - g[i] - b[i]);

        saturation[i] = sat;
        rg[i] = r[i] - g[i];
        yb[i] = 0.5 * (r[i] + g[i]) - b[i];
        hueX += sat * Math.cos(hue);
        hueY += sat * Math.sin(hue);
        satSum += sat;
    }

    return {
        meanSaturation: computeMean(saturation),
        stdSaturation: computeStd(saturation),
        // 1 = one dominant hue, 0 = hues spread around the wheel (or no color at all).
        hueConcentration: satSum === 0 ? 0 : Math.hypot(hueX, hueY) / satSum,
        channelCorrelation:
            (Math.abs(correlation(r, g)) +
                Math.abs(correlation(g, b)) +
                Math.abs(correlation(r, b))) /
            3,
        // Hasler & Süsstrunk colorfulness, on [0, 1] channels.
        colorfulness:
            Math.hypot(computeStd(rg), computeStd(yb)) +
            0.3 * Math.hypot(computeMean(rg), computeMean(yb)),
    };
}

/**
 * Cheap, readable descriptors of one image (square, power-of-two side ≥ 16). Structure comes from
 * the luminance, color from the channels. Key order is stable: it is the column order of the
 * feature table.
 */
export function describeImage(image: RgbImage): Descriptors {
    const { width, height } = image;

    if (width !== height || width < 16 || (width & (width - 1)) !== 0) {
        throw new Error(
            `Image must be square with a power-of-two side >= 16, got ${width}x${height}`,
        );
    }

    const [r, g, b] = planes(image);
    const luma = new Float32Array(r.length);

    for (let i = 0; i < luma.length; i++) {
        luma[i] = 0.299 * r[i] + 0.587 * g[i] + 0.114 * b[i];
    }

    const shares = spectralShares(luma, width, height);
    const last = width - 1;

    const symmetryH = symmetry(luma, width, (x, y) => [last - x, y]);
    const symmetryV = symmetry(luma, width, (x, y) => [x, last - y]);

    return {
        lumaMean: computeMean(luma),
        lumaStd: computeStd(luma),
        lumaEntropy: lumaEntropy(luma),
        flatShare: flatShareOf(image),
        ...gradientStats(luma, width, height),
        ...Object.fromEntries(shares.map((share, i) => [`band${i}`, share])),
        // Orientation-free: which axis a grammar favours is the same style rotated by 90°.
        symmetryAxisMax: Math.max(symmetryH, symmetryV),
        symmetryAxisMin: Math.min(symmetryH, symmetryV),
        symmetryRot: symmetry(luma, width, (x, y) => [last - x, last - y]),
        symmetryDiag: symmetry(luma, width, (x, y) => [y, x]),
        ...colorStats(r, g, b),
    };
}

import { correlation } from './correlation.ts';

export interface RgbImage {
    readonly width: number;
    readonly height: number;
    /** Interleaved RGB bytes, rows top to bottom. */
    readonly rgb: Uint8Array;
}

export type Descriptors = Record<string, number>;

const BAND_COUNT = 4;
const EDGE_THRESHOLD = 0.05;
const FLAT_BLOCK = 8;
const FLAT_STD = 0.02;
const HISTOGRAM_BINS = 16;

function mean(values: ArrayLike<number>): number {
    let sum = 0;

    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }

    return values.length === 0 ? 0 : sum / values.length;
}

function std(values: ArrayLike<number>): number {
    const m = mean(values);
    let sum = 0;

    for (let i = 0; i < values.length; i++) {
        sum += (values[i] - m) ** 2;
    }

    return values.length === 0 ? 0 : Math.sqrt(sum / values.length);
}

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

function flatShare(luma: Float32Array, width: number, height: number): number {
    let flat = 0;
    let blocks = 0;

    for (let by = 0; by + FLAT_BLOCK <= height; by += FLAT_BLOCK) {
        for (let bx = 0; bx + FLAT_BLOCK <= width; bx += FLAT_BLOCK) {
            const values: number[] = [];

            for (let y = 0; y < FLAT_BLOCK; y++) {
                for (let x = 0; x < FLAT_BLOCK; x++) {
                    values.push(luma[(by + y) * width + bx + x]);
                }
            }

            blocks++;

            if (std(values) < FLAT_STD) {
                flat++;
            }
        }
    }

    return flat / blocks;
}

/** Share of flat blocks only: the cheap path for callers that need nothing else. */
export function flatShareOf(image: RgbImage): number {
    const count = image.width * image.height;
    const luma = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        luma[i] =
            (0.299 * image.rgb[i * 3] +
                0.587 * image.rgb[i * 3 + 1] +
                0.114 * image.rgb[i * 3 + 2]) /
            255;
    }

    return flatShare(luma, image.width, image.height);
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
        meanSaturation: mean(saturation),
        stdSaturation: std(saturation),
        // 1 = one dominant hue, 0 = hues spread around the wheel (or no color at all).
        hueConcentration: satSum === 0 ? 0 : Math.hypot(hueX, hueY) / satSum,
        channelCorrelation:
            (Math.abs(correlation(r, g)) +
                Math.abs(correlation(g, b)) +
                Math.abs(correlation(r, b))) /
            3,
        // Hasler & Süsstrunk colorfulness, on [0, 1] channels.
        colorfulness: Math.hypot(std(rg), std(yb)) + 0.3 * Math.hypot(mean(rg), mean(yb)),
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
        lumaMean: mean(luma),
        lumaStd: std(luma),
        lumaEntropy: lumaEntropy(luma),
        flatShare: flatShare(luma, width, height),
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

/**
 * Minimal renderer types shared between the batch renderer and consumers. Kept here (not in
 * dataset/) so @repo/randomart-core stays self-contained.
 */

export interface RgbImage {
    readonly width: number;
    readonly height: number;
    /** Interleaved RGB bytes, rows top to bottom. */
    readonly rgb: Uint8Array;
}

/**
 * Cheap flatness heuristic: share of 8×8 blocks whose luma std < 0.02. Used by the batch renderer
 * to flag collapsed cells without a full descriptor pass.
 */
const FLAT_BLOCK = 8;
const FLAT_STD = 0.02;

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

function lumaPlane(image: RgbImage): Float32Array {
    const count = image.width * image.height;
    const luma = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        luma[i] =
            (0.299 * image.rgb[i * 3] +
                0.587 * image.rgb[i * 3 + 1] +
                0.114 * image.rgb[i * 3 + 2]) /
            255;
    }

    return luma;
}

/** Share of flat blocks only: the cheap path for callers that need nothing else. */
export function flatShareOf(image: RgbImage): number {
    const luma = lumaPlane(image);
    let flat = 0;
    let blocks = 0;

    for (let by = 0; by + FLAT_BLOCK <= image.height; by += FLAT_BLOCK) {
        for (let bx = 0; bx + FLAT_BLOCK <= image.width; bx += FLAT_BLOCK) {
            const values: number[] = [];

            for (let y = 0; y < FLAT_BLOCK; y++) {
                for (let x = 0; x < FLAT_BLOCK; x++) {
                    values.push(luma[(by + y) * image.width + bx + x]);
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

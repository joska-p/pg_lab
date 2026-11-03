import { computeStd } from '../shared/shared';
import type { RgbImage } from './types';

/**
 * The cheap quality gate on a rendered image: a collapsed grammar produces a flat picture, and both
 * the Bench (flagging a dead cell) and the dataset (the `flatShare` descriptor) need to know it
 * without paying for a full descriptor pass.
 *
 * It reads the renderer's output type, so it lives next to the renderer that produces it.
 */

const FLAT_BLOCK = 8;
const FLAT_STD = 0.02;

/** Luminance plane of an image, in [0, 1]. */
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

            if (computeStd(values) < FLAT_STD) {
                flat++;
            }
        }
    }

    return flat / blocks;
}

import { colorSpaceRegistry } from './registry';
import type { ColorSpaceId } from './registry';

/**
 * Channels — how the generated expression becomes the color the shader writes.
 *
 * Two orthogonal axes carried by the grammar:
 *
 * - `space`: interprets the `(r, g, b)` triplet (sRGB, OKLCH, OKLab, HSL). Applied once in `main`.
 * - `shareDepth`: channel structure sharing. `0` = independent trees; `>= maxDepth` = single tree.
 *   Correlation axis replacing the old palette model.
 */

/** Checks if a value is a valid color space ID. */
export function isColorSpaceId(value: unknown): value is ColorSpaceId {
    return typeof value === 'string' && Object.hasOwn(colorSpaceRegistry, value);
}

/** GLSL function name the compiled `main` ends with (e.g., `ra_oklch`). */
export function colorSpaceFunction(space: ColorSpaceId): string {
    return colorSpaceRegistry[space].fn;
}

/** GLSL definition block(s) the preamble must carry for this space. */
export function colorSpaceGlsl(space: ColorSpaceId): string {
    return colorSpaceRegistry[space].glsl;
}

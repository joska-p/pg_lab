import hslGlsl from './hsl.glsl?raw';
import oklabGlsl from './oklab.glsl?raw';
import oklchGlsl from './oklch.glsl?raw';
import srgbGlsl from './srgb.glsl?raw';
import type { ColorSpace } from './types';

/** Registry of color spaces, keyed by color space ID. */
export const colorSpaceRegistry = {
    srgb: {
        id: 'srgb',
        label: 'sRGB',
        fn: 'ra_srgb',
        glsl: srgbGlsl,
    },
    oklch: {
        id: 'oklch',
        label: 'OKLCH',
        fn: 'ra_oklch',
        glsl: oklchGlsl,
    },
    oklab: {
        id: 'oklab',
        label: 'OKLab',
        fn: 'ra_oklab',
        glsl: oklabGlsl,
    },
    hsl: {
        id: 'hsl',
        label: 'HSL',
        fn: 'ra_hsl',
        glsl: hslGlsl,
    },
} as const satisfies Record<string, ColorSpace>;

/** Opaque key into the color space registry. Inferred from the registry keys. */
export type ColorSpaceId = keyof typeof colorSpaceRegistry;

/** All known color space IDs as a readonly tuple. */
export const colorSpaceIds = Object.keys(colorSpaceRegistry) as readonly ColorSpaceId[];

/** Type of the color space registry (for internal use). */
export type ColorSpaceRegistry = typeof colorSpaceRegistry;

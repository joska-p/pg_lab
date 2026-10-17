/**
 * Color model — how the generated expression becomes the RGB the shader writes.
 *
 * - `unrelated`: three independent expression trees, one per channel (the historical model). This is
 *   the raw space: the channels share no structure, so most results read as coloured noise.
 * - `correlated`: ONE expression tree (the field) sampled through a palette, so the three channels
 *   are coherent by construction. This is what `defaultGrammar` uses.
 *
 * The model lives in the grammar (it describes the image space, like the vocabulary does), travels
 * with it through serialization and the artwork provenance, and the palette's GLSL is emitted by
 * the compiler. It replaces the old implicit "three channels in, RGB out" rule (nothing needed to
 * say it), so a grammar always carries an explicit choice.
 */

/**
 * The curated palettes. A palette is a render concern, but its _identity_ is core data (it is part
 * of the grammar), so the ids live here while the compiler owns the GLSL.
 */
export type PaletteId = 'spectrum' | 'ember' | 'forest' | 'ice' | 'mono';

export interface Palette {
    readonly id: PaletteId;
    /** Name shown in the UI. */
    readonly label: string;
    /**
     * Full GLSL definition of `vec3 ra_pal(float t)` for `t` in `[0, 1]`. Every palette defines the
     * same function name: only one is ever emitted per shader, so there is no collision.
     */
    readonly code: string;
}

/**
 * Inigo Quilez-style cosine palette: `a + b·cos(2π(c·t + d))`, clamped to `[0, 1]`. Cheap, smooth,
 * and each `(a, b, c, d)` quadruple gives a distinct, pleasant gradient.
 */
function cosinePalette(a: string, b: string, c: string, d: string): string {
    return [
        'vec3 ra_pal(float t) {',
        `    vec3 a = ${a};`,
        `    vec3 b = ${b};`,
        `    vec3 c = ${c};`,
        `    vec3 d = ${d};`,
        '    return clamp(a + b * cos(6.283185307179586 * (c * t + d)), 0.0, 1.0);',
        '}',
    ].join('\n');
}

export const PALETTES = {
    spectrum: {
        id: 'spectrum',
        label: 'Spectrum',
        code: cosinePalette('vec3(0.5)', 'vec3(0.5)', 'vec3(1.0)', 'vec3(0.0, 0.33, 0.67)'),
    },
    ember: {
        id: 'ember',
        label: 'Ember',
        code: cosinePalette(
            'vec3(0.5)',
            'vec3(0.5)',
            'vec3(1.0, 0.7, 0.4)',
            'vec3(0.0, 0.15, 0.20)',
        ),
    },
    forest: {
        id: 'forest',
        label: 'Forest',
        code: cosinePalette(
            'vec3(0.5)',
            'vec3(0.5)',
            'vec3(2.0, 1.0, 0.0)',
            'vec3(0.5, 0.20, 0.25)',
        ),
    },
    ice: {
        id: 'ice',
        label: 'Ice',
        code: cosinePalette(
            'vec3(0.8, 0.5, 0.4)',
            'vec3(0.2, 0.4, 0.2)',
            'vec3(2.0, 1.0, 1.0)',
            'vec3(0.0, 0.25, 0.25)',
        ),
    },
    mono: {
        id: 'mono',
        label: 'Mono',
        // Not a cosine sweep: a plain grayscale ramp, handy to judge the structure alone.
        code: ['vec3 ra_pal(float t) {', '    return vec3(t);', '}'].join('\n'),
    },
} satisfies Record<PaletteId, Palette>;

export const PALETTE_IDS = Object.keys(PALETTES) as readonly PaletteId[];

export function isPaletteId(value: unknown): value is PaletteId {
    return typeof value === 'string' && Object.hasOwn(PALETTES, value);
}

export function paletteGlsl(id: PaletteId): string {
    return PALETTES[id].code;
}

export type ColorModel =
    | { readonly kind: 'unrelated' }
    | { readonly kind: 'correlated'; readonly palette: PaletteId };

/**
 * The fallback of `createGrammar` when the caller says nothing: the plain model (three channels in,
 * RGB out), so a grammar built from parts without a colour choice behaves as it always did.
 */
export const UNRELATED_COLOR: ColorModel = { kind: 'unrelated' };

/**
 * The app's default (`defaultGrammar`): one field through the rainbow palette. Correlated colour is
 * the model that actually produces readable images from random expressions, so it is the default of
 * the _curated_ grammar — not of the low-level constructor.
 */
export const DEFAULT_COLOR: ColorModel = { kind: 'correlated', palette: 'spectrum' };

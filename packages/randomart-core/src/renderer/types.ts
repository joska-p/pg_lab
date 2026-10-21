/**
 * The pixel contract the renderer produces. It is shared by the batch renderer, the Bench and the
 * dataset, so it lives in the deepest directory common to them (§2.6): the renderer cluster.
 *
 * The cheap flatness check on that image lives in `./flatness`, next to this type.
 */

export interface RgbImage {
    readonly width: number;
    readonly height: number;
    /** Interleaved RGB bytes, rows top to bottom. */
    readonly rgb: Uint8Array;
}

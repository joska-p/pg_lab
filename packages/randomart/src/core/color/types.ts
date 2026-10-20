import type { ColorSpaceId } from '../config/index.ts';
/**
 * How the raw triplet is read before output: the space, and how deep the three channels share their
 * structure. `shareDepth` is a generator concern, not a render one.
 */
export interface ChannelModel {
    /** Interpretation of `(r, g, b)`, applied once at the end of `main`. */
    readonly space: ColorSpaceId;
    /**
     * Depth of the trunk the three channels share. `0` = independent trees; `>= maxDepth` = one
     * tree, so `r = g = b`. `createGrammar` repairs it into `[0, maxDepth]`.
     */
    readonly shareDepth: number;
}

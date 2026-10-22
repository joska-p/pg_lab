/** Background of the planche (empty cells and padding), a neutral near-black. */
export const PLANCHE_BACKGROUND: readonly [number, number, number] = [16, 16, 22];

/**
 * What a dimmed cell keeps of its pixels. Dimming is the non-destructive answer to "this grammar
 * collapsed": the cell stays in its slot, so the grid keeps its shape.
 */
export const PLANCHE_DIM_FACTOR = 0.35;

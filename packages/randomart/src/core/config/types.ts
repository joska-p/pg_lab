export interface ParamRange {
    readonly min: number;
    readonly max: number;
}

/** How the `(r, g, b)` triplet the expression produces is interpreted before output. */
export type ColorSpaceId = 'srgb' | 'oklch' | 'oklab' | 'hsl';

/**
 * Depth/node budget of a grammar. Constraints are not stored free-form: they are derived from the
 * grammar's `size` profile (`constraintsOf`), so no combination can be infeasible and there is
 * nothing to repair.
 */
export interface Constraints {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

export type SizeProfileId = 'small' | 'medium' | 'large';
export type SizeProfiles = Readonly<Record<SizeProfileId, Constraints>>;

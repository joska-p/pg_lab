import type { SizeConstraints, SizeProfile } from './types';

export const SIZE_PROFILES: Record<SizeProfile, SizeConstraints> = {
    tiny: { minDepth: 1, maxDepth: 3, maxNodes: 10 },
    small: { minDepth: 1, maxDepth: 4, maxNodes: 16 },
    medium: { minDepth: 2, maxDepth: 5, maxNodes: 25 },
    large: { minDepth: 2, maxDepth: 6, maxNodes: 40 },
};

export const DEFAULT_SHARE_DEPTH = 1;

/** Fixed maximum weight for all grammars and draws. */
export const MAX_WEIGHT = 16;

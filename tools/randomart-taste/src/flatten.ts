import { COLOR_SPACE_IDS } from '@repo/randomart-core/colors';
import { OP_NAMES } from '@repo/randomart-core/ops';

import { countOf } from './features';
import type { ExpressionFeatures } from './features';

/**
 * One flat numeric row per expression: every key is always present (operators and color spaces
 * default to 0), so rows line up as columns for a regression.
 */
export function flattenFeatures(features: ExpressionFeatures): Record<string, number> {
    const row: Record<string, number> = {};

    for (const name of OP_NAMES) {
        row[`op.${name}`] = countOf(features, name);
    }

    row.dagNodes = features.dagNodes;
    row.treeNodes = features.treeNodes;
    row.depth = features.depth;
    row.sharedDepth = features.sharedDepth;
    row.mono = features.mono ? 1 : 0;
    row.animated = features.animated ? 1 : 0;
    row['modulation.count'] = features.modulation.count;
    row['modulation.meanAmp'] = features.modulation.meanAmp;
    row['modulation.meanCycles'] = features.modulation.meanCycles;

    for (const id of COLOR_SPACE_IDS) {
        row[`space.${id}`] = features.space === id ? 1 : 0;
    }

    return row;
}

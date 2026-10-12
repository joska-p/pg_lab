import { buildChannelTrees, getRule, OPERATORS } from '../../core';
import type { ChannelTrees, OperatorId, RuleId } from '../../core';
import type { RandomartState } from './store';

export interface TreeConfig {
    seedText: string;
    selectedRuleId: RuleId;
    customOperatorIds: OperatorId[] | null;
    minDepth: number;
    maxDepth: number;
    correlated: boolean;
}

// The single mapping from owned state to generation inputs. Actions write
// state; consumers derive trees through this — never the reverse.
export function selectTreeConfig(state: RandomartState): TreeConfig {
    const { seedText, selectedRuleId, customOperatorIds, minDepth, maxDepth, correlatedRGB } =
        state;

    return {
        seedText,
        selectedRuleId,
        customOperatorIds,
        minDepth,
        maxDepth,
        correlated: correlatedRGB,
    };
}

const CANONICAL_ORDER = Object.keys(OPERATORS) as OperatorId[];

function canonicalSort(ids: OperatorId[]): OperatorId[] {
    const index = new Map(CANONICAL_ORDER.map((id, i) => [id, i]));

    return [...ids].sort((a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0));
}

export function generateTrees(config: TreeConfig): ChannelTrees {
    const preset = getRule(config.selectedRuleId);

    const operatorIds = canonicalSort(config.customOperatorIds ?? preset.operatorIds);

    const rule = {
        id: config.selectedRuleId,
        label: preset.label,
        kind: preset.kind,
        operatorIds,
        minDepth: config.minDepth,
        maxDepth: config.maxDepth,
    };

    return buildChannelTrees({
        seedText: config.seedText,
        rule,
        correlated: config.correlated,
    });
}

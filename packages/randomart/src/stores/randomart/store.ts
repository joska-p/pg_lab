import { create } from 'zustand';

import { DEFAULT_RULE_ID, getRule } from '../../core';
import type { BehaviorId, Channel, ColorSpaceId, OperatorId, RuleId } from '../../core';

export type Mode = 'test' | 'play';

// Generation inputs. Owned by the store; trees.ts derives the channel trees
// from these, so trees are never stored and cannot go stale.
export interface RandomartConfig {
    seedText: string;
    selectedRuleId: RuleId;
    customOperatorIds: OperatorId[] | null;
    minDepth: number;
    maxDepth: number;
    correlatedRGB: boolean;
}

export interface RandomartState extends RandomartConfig {
    mode: Mode;
    activeChannel: Channel;
    running: boolean;
    animationSpeed: number;
    activeBehaviorIds: BehaviorId[];
    colorSpace: ColorSpaceId;
}

// Serializable subset that reproduces an image (S4 import/export).
// Pure UI state (mode, activeChannel, running) stays out.
export interface RandomartRecipe extends RandomartConfig {
    activeBehaviorIds: BehaviorId[];
}

// The store owns shared values: generation config + UI selection.
// Channel trees are NOT stored — consumers derive them with useChannelTrees,
// so a config change cannot leave stale trees behind. Per-frame time is NOT
// stored either — the S3 render loop will own its clock (see the ClockStore
// pattern in art-canvas) instead of broadcasting every frame through zustand.
function generateInitial(): RandomartState {
    const preset = getRule(DEFAULT_RULE_ID);

    return {
        mode: 'play',
        seedText: "De deux choses lune l'autre c'est le soleil",
        activeChannel: 'red',
        selectedRuleId: DEFAULT_RULE_ID,
        customOperatorIds: null,
        minDepth: preset.minDepth,
        maxDepth: preset.maxDepth,
        running: false,
        animationSpeed: 0.3,
        activeBehaviorIds: ['hue-shift'],
        colorSpace: 'srgb',
        correlatedRGB: false,
    };
}

const randomartStore = create<RandomartState>()(() => generateInitial());

export { randomartStore };

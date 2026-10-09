import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
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
    clockStore: ClockStore;
    animationSpeed: number;
    activeBehaviorIds: BehaviorId[];
    colorSpace: ColorSpaceId;
}

// Serializable subset that reproduces an image (S4 import/export).
// Pure UI state (mode, activeChannel) stays out.
export interface RandomartRecipe extends RandomartConfig {
    activeBehaviorIds: BehaviorId[];
}

// The store owns shared values: generation config + UI selection, plus a
// stable reference to the surface's clock (reachability, not ownership — the
// surface owns its lifecycle). Channel trees are NOT stored — consumers derive
// them with useChannelTrees, so a config change cannot leave stale trees
// behind. Per-frame time and play/pause are NOT stored either: the clock owns
// them and consumers subscribe to it (the ClockStore pattern in art-canvas)
// instead of broadcasting every frame through zustand.
//
// `nullClockStore` is a sentinel: the store starts with it, and `GpuCanvas`
// replaces it with the real store once the surface mounts.
const nullClockStore = createNullClockStore();

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
        clockStore: nullClockStore,
        animationSpeed: 0.3,
        activeBehaviorIds: ['hue-shift'],
        colorSpace: 'srgb',
        correlatedRGB: false,
    };
}

const randomartStore = create<RandomartState>()(() => generateInitial());

export { nullClockStore, randomartStore };

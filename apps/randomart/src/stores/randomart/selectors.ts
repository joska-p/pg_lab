import type { GpuSurface } from '@repo/glaze/gpu/GpuSurface';
import type { ClockStore } from '@repo/glaze/react/types';

import type {
    BehaviorId,
    Channel,
    ChannelTrees,
    ColorSpaceId,
    Node,
    OperatorId,
    RuleId,
} from '../../core';
import { nullClockStore, randomartStore } from './store';
import type { Mode } from './store';
import { generateTrees } from './trees';

export function useMode(): Mode {
    return randomartStore((s) => s.mode);
}

export function useSeedText(): string {
    return randomartStore((s) => s.seedText);
}

export function useMaxDepth(): number {
    return randomartStore((s) => s.maxDepth);
}

export function useSelectedRuleId(): RuleId {
    return randomartStore((s) => s.selectedRuleId);
}

export function useCustomOperators(): OperatorId[] | null {
    return randomartStore((s) => s.customOperatorIds);
}

export function useMinDepth(): number {
    return randomartStore((s) => s.minDepth);
}

export function useActiveChannel(): Channel {
    return randomartStore((s) => s.activeChannel);
}

export function useClockStore(): ClockStore {
    return randomartStore((s) => s.clockStore);
}

export function useHasClockStore(): boolean {
    return randomartStore((s) => s.clockStore !== nullClockStore);
}

export function useGpuSurface(): GpuSurface | null {
    return randomartStore((s) => s.gpuSurface);
}

export function useAnimationSpeed(): number {
    return randomartStore((s) => s.animationSpeed);
}

export function useActiveBehaviorIds(): BehaviorId[] {
    return randomartStore((s) => s.activeBehaviorIds);
}

export function useColorSpace(): ColorSpaceId {
    return randomartStore((s) => s.colorSpace);
}

export function useCorrelatedRGB(): boolean {
    return randomartStore((s) => s.correlatedRGB);
}

// Derived data, not stored state. Subscribes to the config fields only, so
// unrelated UI changes (channel, mode) never rebuild the trees.
export function useChannelTrees(): ChannelTrees {
    const seedText = useSeedText();
    const selectedRuleId = useSelectedRuleId();
    const customOperatorIds = useCustomOperators();
    const minDepth = useMinDepth();
    const maxDepth = useMaxDepth();
    const correlatedRGB = useCorrelatedRGB();

    return generateTrees({
        seedText,
        selectedRuleId,
        customOperatorIds,
        minDepth,
        maxDepth,
        correlated: correlatedRGB,
    });
}

export function useSelectedTree(): Node {
    return useChannelTrees()[useActiveChannel()];
}

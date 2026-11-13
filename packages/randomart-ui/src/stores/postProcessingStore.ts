import { create } from 'zustand';

import { POST_PROCESS_EFFECTS } from '../postProcessing/effects';
import type { PostProcessEffectId } from '../postProcessing/effects';

interface PostProcessingState {
    readonly activeEffects: Readonly<Record<PostProcessEffectId, boolean>>;
}

function createInitialActiveEffects(): Record<PostProcessEffectId, boolean> {
    const effects: Record<PostProcessEffectId, boolean> = {
        grain: false,
    };
    for (const effect of POST_PROCESS_EFFECTS) {
        effects[effect.id] = effect.defaultActive;
    }
    return effects;
}

const initialActiveEffects = createInitialActiveEffects();

const store = create<PostProcessingState>(() => ({
    activeEffects: initialActiveEffects,
}));

export function getActiveEffects(): Readonly<Record<PostProcessEffectId, boolean>> {
    return store.getState().activeEffects;
}

export function isEffectActive(id: PostProcessEffectId): boolean {
    return store.getState().activeEffects[id] ?? false;
}

export function useActiveEffects(): Readonly<Record<PostProcessEffectId, boolean>> {
    return store((state) => state.activeEffects);
}

export function useIsEffectActive(id: PostProcessEffectId): boolean {
    return store((state) => state.activeEffects[id] ?? false);
}

export function setEffectActive(id: PostProcessEffectId, active: boolean): void {
    store.setState((state) => ({
        activeEffects: {
            ...state.activeEffects,
            [id]: active,
        },
    }));
}

export function resetPostProcessing(): void {
    store.setState({ activeEffects: initialActiveEffects });
}

export function getActiveEffectsKey(
    activeEffects: Readonly<Record<PostProcessEffectId, boolean>>,
): string {
    return POST_PROCESS_EFFECTS.filter((effect) => activeEffects[effect.id])
        .map((effect) => effect.id)
        .sort()
        .join(',');
}

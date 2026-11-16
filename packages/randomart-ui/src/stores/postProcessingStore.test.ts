import { beforeEach, describe, expect, it } from 'vite-plus/test';

import { POST_PROCESS_EFFECTS } from '../postProcessing/effects';
import type { PostProcessEffectId } from '../postProcessing/effects';
import {
    getActiveEffects,
    getActiveEffectsKey,
    isEffectActive,
    resetPostProcessing,
    setEffectActive,
} from './postProcessingStore';

/** Builds a complete effect map from the registry, so new effects do not break the test. */
function activeEffects(
    overrides: Partial<Record<PostProcessEffectId, boolean>> = {},
): Record<PostProcessEffectId, boolean> {
    return Object.fromEntries(
        POST_PROCESS_EFFECTS.map((effect) => [effect.id, overrides[effect.id] ?? false]),
    ) as Record<PostProcessEffectId, boolean>;
}

describe('postProcessingStore', () => {
    beforeEach(() => {
        resetPostProcessing();
    });

    it('initializes effects according to their defaultActive settings', () => {
        const effects = getActiveEffects();
        for (const effect of POST_PROCESS_EFFECTS) {
            expect(effects[effect.id]).toBe(effect.defaultActive);
        }
    });

    it('updates active state of an effect', () => {
        expect(isEffectActive('grain')).toBe(false);
        setEffectActive('grain', true);
        expect(isEffectActive('grain')).toBe(true);
        setEffectActive('grain', false);
        expect(isEffectActive('grain')).toBe(false);
    });

    it('computes deterministically sorted active effects key', () => {
        expect(getActiveEffectsKey(activeEffects())).toBe('');
        expect(getActiveEffectsKey(activeEffects({ grain: true }))).toBe('grain');
        expect(getActiveEffectsKey(activeEffects({ smin: true, smax: true }))).toBe('smax,smin');
    });
});

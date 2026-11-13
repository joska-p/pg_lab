import { beforeEach, describe, expect, it } from 'vite-plus/test';

import { POST_PROCESS_EFFECTS } from '../postProcessing/effects';
import {
    getActiveEffects,
    getActiveEffectsKey,
    isEffectActive,
    resetPostProcessing,
    setEffectActive,
} from './postProcessingStore';

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
        expect(getActiveEffectsKey({ grain: false })).toBe('');
        expect(getActiveEffectsKey({ grain: true })).toBe('grain');
    });
});

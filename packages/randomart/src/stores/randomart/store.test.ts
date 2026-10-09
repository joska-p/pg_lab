import { describe, expect, it } from 'vite-plus/test';

import { compileToShader } from '../../core';
import { importRecipe, selectRule, setSeedText, toggleOperator } from './actions';
import { randomartStore } from './store';
import { generateTrees, selectTreeConfig } from './trees';

describe('randomart store', () => {
    it('starts from the classic preset, paused', () => {
        const state = randomartStore.getState();

        expect(state.mode).toBe('play');
        expect(state.selectedRuleId).toBe('classic');
        expect(state.customOperatorIds).toBeNull();
        expect(state.maxDepth).toBeGreaterThanOrEqual(state.minDepth);
        expect(state.running).toBe(false);
    });

    it('derives channel trees deterministically from the config', () => {
        setSeedText('alpha');
        const alpha = generateTrees(selectTreeConfig(randomartStore.getState()));

        setSeedText('beta');
        const beta = generateTrees(selectTreeConfig(randomartStore.getState()));
        expect(beta).not.toEqual(alpha);

        setSeedText('alpha');
        expect(generateTrees(selectTreeConfig(randomartStore.getState()))).toEqual(alpha);
    });

    it('compiles the derived trees to a GLSL shader', () => {
        setSeedText('alpha');
        const state = randomartStore.getState();

        const shader = compileToShader({
            seedText: state.seedText,
            trees: generateTrees(selectTreeConfig(state)),
        });

        expect(shader).toContain('void main');
    });

    it('selectRule resets the custom operator set and depths', () => {
        toggleOperator('sin');
        expect(randomartStore.getState().customOperatorIds).not.toBeNull();

        selectRule('classic');
        const state = randomartStore.getState();

        expect(state.customOperatorIds).toBeNull();
        expect(state.maxDepth).toBeGreaterThanOrEqual(state.minDepth);
    });

    it('importRecipe applies config and behaviors in one write', () => {
        setSeedText('before-import');

        importRecipe({
            seedText: 'imported',
            selectedRuleId: 'paper',
            customOperatorIds: null,
            minDepth: 1,
            maxDepth: 4,
            correlatedRGB: true,
            activeBehaviorIds: [],
        });

        const state = randomartStore.getState();

        expect(state.seedText).toBe('imported');
        expect(state.selectedRuleId).toBe('paper');
        expect(state.correlatedRGB).toBe(true);
        expect(state.activeBehaviorIds).toEqual([]);
    });
});

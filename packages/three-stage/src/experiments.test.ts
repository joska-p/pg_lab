import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_EXPERIMENT, experimentOptions, getExperiment } from './experiments';

describe('three-stage sub-experiments', () => {
    it('resolves a known id to its definition', () => {
        expect(getExperiment('stage')).toMatchObject({ id: 'stage', label: 'Stage' });
    });

    it('reports unknown, empty and missing ids as absent', () => {
        expect(getExperiment('not-a-sub-experiment')).toBeUndefined();
        expect(getExperiment('')).toBeUndefined();
        expect(getExperiment(undefined)).toBeUndefined();
    });

    it('keeps the getStarted default explicit and selectable', () => {
        expect(DEFAULT_EXPERIMENT).toMatchObject({ id: 'getStarted', label: 'Get started' });
        expect(getExperiment(DEFAULT_EXPERIMENT.id)).toBe(DEFAULT_EXPERIMENT);
        expect(experimentOptions).toContainEqual({
            value: DEFAULT_EXPERIMENT.id,
            label: DEFAULT_EXPERIMENT.label,
        });
    });

    it('exposes select options in registry order', () => {
        expect(experimentOptions.map(({ value }) => value)).toEqual(['getStarted', 'stage']);
    });
});

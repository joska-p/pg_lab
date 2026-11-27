import { describe, expect, it, vi } from 'vite-plus/test';

import {
    EXPERIMENTS,
    experimentCount,
    experimentOptions,
    experimentPath,
    getExperiment,
    loadExperiment,
} from './experiments';

const experimentModule = { Experiment: () => null };

function definedExperiment(id: string) {
    const experiment = getExperiment(id);

    if (!experiment) {
        throw new Error(`Missing experiment: ${id}`);
    }

    return experiment;
}

describe('playground experiment catalogue', () => {
    it('resolves a known id to the catalogue definition', () => {
        expect(getExperiment('art-canvas')).toBe(EXPERIMENTS[0]);
        expect(definedExperiment('art-canvas')).toMatchObject({
            id: 'art-canvas',
            label: 'Art Canvas',
            stageLabel: 'art-canvas',
        });
    });

    it('treats unknown and missing ids as absent', () => {
        expect(getExperiment('not-an-experiment')).toBeUndefined();
        expect(getExperiment('')).toBeUndefined();
        expect(getExperiment(undefined)).toBeUndefined();
    });

    it('keeps experiment paths stable', () => {
        expect(experimentPath(definedExperiment('art-canvas'))).toBe('/art-canvas');

        for (const experiment of EXPERIMENTS) {
            expect(experimentPath(experiment)).toBe(`/${experiment.id}`);
        }
    });

    it('exposes select options in catalogue order', () => {
        expect(experimentOptions).toHaveLength(experimentCount);
        expect(experimentOptions).toEqual(
            EXPERIMENTS.map(({ id, label }) => ({ value: id, label })),
        );
    });

    it('dedupes experiment loads by experiment id', async () => {
        const definition = definedExperiment('sequencer');
        const firstLoad = vi.fn(async () => experimentModule);
        const secondLoad = vi.fn(async () => experimentModule);

        const first = loadExperiment({ ...definition, loadExperiment: firstLoad });
        const second = loadExperiment({ ...definition, loadExperiment: secondLoad });

        expect(second).toBe(first);
        await expect(first).resolves.toBe(experimentModule);
        expect(firstLoad).toHaveBeenCalledTimes(1);
        expect(secondLoad).not.toHaveBeenCalled();
    });

    it('evicts a failed experiment load so the next call retries', async () => {
        const definition = definedExperiment('notebook');
        const failingLoad = vi.fn(() => Promise.reject(new Error('experiment offline')));
        const retryLoad = vi.fn(async () => experimentModule);

        await expect(
            loadExperiment({ ...definition, loadExperiment: failingLoad }),
        ).rejects.toThrow('experiment offline');
        await expect(loadExperiment({ ...definition, loadExperiment: retryLoad })).resolves.toBe(
            experimentModule,
        );

        expect(failingLoad).toHaveBeenCalledTimes(1);
        expect(retryLoad).toHaveBeenCalledTimes(1);
    });
});

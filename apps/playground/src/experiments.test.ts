import { describe, expect, it, vi } from 'vite-plus/test';

import {
    EXPERIMENTS,
    experimentCount,
    experimentOptions,
    experimentPath,
    getExperiment,
    loadControls,
    loadScene,
} from './experiments';

const sceneModule = { Scene: () => null };
const controlsModule = { Controls: () => null };

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

    it('dedupes scene loads by experiment id', async () => {
        const definition = definedExperiment('sequencer');
        const firstLoad = vi.fn(async () => sceneModule);
        const secondLoad = vi.fn(async () => sceneModule);

        const first = loadScene({ ...definition, loadScene: firstLoad });
        const second = loadScene({ ...definition, loadScene: secondLoad });

        expect(second).toBe(first);
        await expect(first).resolves.toBe(sceneModule);
        expect(firstLoad).toHaveBeenCalledTimes(1);
        expect(secondLoad).not.toHaveBeenCalled();
    });

    it('evicts a failed scene load so the next call retries', async () => {
        const definition = definedExperiment('notebook');
        const failingLoad = vi.fn(() => Promise.reject(new Error('scene offline')));
        const retryLoad = vi.fn(async () => sceneModule);

        await expect(loadScene({ ...definition, loadScene: failingLoad })).rejects.toThrow(
            'scene offline',
        );
        await expect(loadScene({ ...definition, loadScene: retryLoad })).resolves.toBe(sceneModule);

        expect(failingLoad).toHaveBeenCalledTimes(1);
        expect(retryLoad).toHaveBeenCalledTimes(1);
    });

    it('returns null for an experiment without a controls loader', async () => {
        // No catalogue entry omits controls today; override the loader to pin the branch.
        const definition = definedExperiment('palette');

        await expect(loadControls({ ...definition, loadControls: undefined })).resolves.toBeNull();
    });

    it('dedupes controls loads by experiment id', async () => {
        const definition = definedExperiment('oeis-signal');
        const firstLoad = vi.fn(async () => controlsModule);
        const secondLoad = vi.fn(async () => controlsModule);

        const first = loadControls({ ...definition, loadControls: firstLoad });
        const second = loadControls({ ...definition, loadControls: secondLoad });

        expect(second).toBe(first);
        await expect(first).resolves.toBe(controlsModule);
        expect(firstLoad).toHaveBeenCalledTimes(1);
        expect(secondLoad).not.toHaveBeenCalled();
    });

    it('evicts a failed controls load so the next call retries', async () => {
        const definition = definedExperiment('pixel-manipulator');
        const failingLoad = vi.fn(() => Promise.reject(new Error('controls offline')));
        const retryLoad = vi.fn(async () => controlsModule);

        await expect(loadControls({ ...definition, loadControls: failingLoad })).rejects.toThrow(
            'controls offline',
        );
        await expect(loadControls({ ...definition, loadControls: retryLoad })).resolves.toBe(
            controlsModule,
        );

        expect(failingLoad).toHaveBeenCalledTimes(1);
        expect(retryLoad).toHaveBeenCalledTimes(1);
    });
});

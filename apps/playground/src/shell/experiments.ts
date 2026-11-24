import type { ComponentType } from 'react';

import type { ControlsModule, ExperimentMetadata, SceneModule } from './types';

export type ExperimentId = string;

export interface ExperimentDefinition extends ExperimentMetadata {
    readonly id: ExperimentId;
    readonly stageLabel: string;
    readonly panelTitle: string;
    readonly loadScene: () => Promise<SceneModule>;
    readonly loadControls?: () => Promise<ControlsModule>;
}

interface ManifestModule {
    readonly experiment: ExperimentMetadata;
}

type ComponentLoader = () => Promise<ComponentType>;

const manifestModules = import.meta.glob<ManifestModule>('../experiments/*/manifest.ts', {
    eager: true,
});

const sceneLoaders: Record<string, ComponentLoader> = {
    ...import.meta.glob<ComponentType>('../experiments/*/Scene.tsx', { import: 'Scene' }),
    ...import.meta.glob<ComponentType>('../experiments/*/components/Scene.tsx', {
        import: 'Scene',
    }),
};

const controlsLoaders: Record<string, ComponentLoader> = {
    ...import.meta.glob<ComponentType>('../experiments/*/Controls.tsx', { import: 'Controls' }),
    ...import.meta.glob<ComponentType>('../experiments/*/components/Controls.tsx', {
        import: 'Controls',
    }),
};

function idFromPath(path: string): ExperimentId {
    const segments = path.split('/');
    const id = segments[segments.indexOf('experiments') + 1];

    if (id == null) {
        throw new Error(`Invalid experiment path: ${path}`);
    }

    return id;
}

function createDefinition(id: ExperimentId, metadata: ExperimentMetadata): ExperimentDefinition {
    const sceneLoader =
        sceneLoaders[`../experiments/${id}/Scene.tsx`] ??
        sceneLoaders[`../experiments/${id}/components/Scene.tsx`];
    const controlsLoader =
        controlsLoaders[`../experiments/${id}/Controls.tsx`] ??
        controlsLoaders[`../experiments/${id}/components/Controls.tsx`];

    if (!sceneLoader) {
        throw new Error(`Missing Scene for experiment: ${id}`);
    }

    return {
        id,
        ...metadata,
        stageLabel: metadata.stageLabel ?? metadata.label.toLowerCase(),
        panelTitle: metadata.panelTitle ?? metadata.label,
        loadScene: async () => ({ Scene: await sceneLoader() }),
        ...(controlsLoader
            ? { loadControls: async () => ({ Controls: await controlsLoader() }) }
            : {}),
    };
}

function compareDefinitions(a: ExperimentDefinition, b: ExperimentDefinition): number {
    if (a.isHome !== b.isHome) {
        return a.isHome ? -1 : 1;
    }

    return a.label.localeCompare(b.label, 'fr');
}

export const EXPERIMENTS: readonly ExperimentDefinition[] = Object.entries(manifestModules)
    .map(([path, module]) => createDefinition(idFromPath(path), module.experiment))
    .sort(compareDefinitions);

export const experimentCount = EXPERIMENTS.length;

export const interactiveExperiments = EXPERIMENTS.filter((experiment) => !experiment.isHome);

export function experimentPath(experiment: ExperimentDefinition): string {
    return experiment.isHome ? '/' : `/${experiment.id}`;
}

export const experimentsById = new Map<ExperimentId, ExperimentDefinition>(
    EXPERIMENTS.map((experiment): [ExperimentId, ExperimentDefinition] => [
        experiment.id,
        experiment,
    ]),
);

function firstExperiment(): ExperimentDefinition {
    const experiment = EXPERIMENTS[0];

    if (!experiment) {
        throw new Error('No experiments are registered');
    }

    return experiment;
}

export function getExperiment(id: string | undefined): ExperimentDefinition {
    return experimentsById.get(id ?? '') ?? firstExperiment();
}

// Select options share the registry's ordering and metadata.
export const experimentOptions = EXPERIMENTS.map(({ id, label }) => ({
    value: id,
    label,
}));

// Cache loaded modules to avoid repeating dynamic imports.
function cached<Key, Value>(
    cache: Map<Key, Promise<Value>>,
    key: Key,
    load: () => Promise<Value>,
): Promise<Value> {
    const hit = cache.get(key);

    if (hit) {
        return hit;
    }

    const promise = load();
    cache.set(key, promise);

    // Drop failures so ErrorBoundary Retry refetches instead of rethrowing.
    void promise.then(
        () => undefined,
        () => {
            cache.delete(key);
        },
    );

    return promise;
}

const sceneCache = new Map<ExperimentId, Promise<SceneModule>>();

const controlsCache = new Map<ExperimentId, Promise<ControlsModule>>();

const NO_CONTROLS: Promise<null> = Promise.resolve(null);

export function loadScene(experiment: ExperimentDefinition): Promise<SceneModule> {
    return cached(sceneCache, experiment.id, experiment.loadScene);
}

export function loadControls(experiment: ExperimentDefinition): Promise<ControlsModule | null> {
    return experiment.loadControls
        ? cached(controlsCache, experiment.id, experiment.loadControls)
        : NO_CONTROLS;
}

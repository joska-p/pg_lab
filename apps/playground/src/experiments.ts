import type { StageProps } from '@repo/ui/components/Stage';
import type { ComponentType } from 'react';

export interface SceneModule {
    Scene: ComponentType;
    stageProps?: StageProps;
}

export interface ControlsModule {
    Controls: ComponentType;
}

export interface Experiment<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
    readonly panelTitle: string;
    readonly stageLabel: string;
    readonly loadScene: () => Promise<SceneModule>;
    readonly loadControls: () => Promise<ControlsModule>;
}

export const EXPERIMENTS = [
    {
        id: 'home',
        label: 'Home',
        panelTitle: 'home',
        stageLabel: 'home',
        loadScene: () => import('./components/home/Scene'),
        loadControls: () => import('./components/home/Controls'),
    },
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        panelTitle: 'art-canvas',
        stageLabel: 'art-canvas',
        loadScene: () => import('@repo/art-canvas/Scene'),
        loadControls: () => import('@repo/art-canvas/Controls'),
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        panelTitle: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        loadScene: () => import('@repo/mosaic-maker/Scene'),
        loadControls: () => import('@repo/mosaic-maker/Controls'),
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        panelTitle: 'mol-demo',
        stageLabel: 'mol-demo',
        loadScene: () => import('@repo/mol-demo/Scene'),
        loadControls: () => import('@repo/mol-demo/Controls'),
    },
    {
        id: 'automa',
        label: 'Automa',
        panelTitle: 'automa controls',
        stageLabel: 'automa',
        loadScene: () => import('@repo/automa/Scene'),
        loadControls: () => import('@repo/automa/Controls'),
    },
    {
        id: 'fracture',
        label: 'Fracture',
        panelTitle: 'fracture',
        stageLabel: 'fracture',
        loadScene: () => import('@repo/fracture/Scene'),
        loadControls: () => import('@repo/fracture/Controls'),
    },
    {
        id: 'radu-machine-learning',
        label: 'radu-machine-learning',
        panelTitle: 'Radu machine learning',
        stageLabel: 'Radu machine learning',
        loadScene: () => import('@repo/radu-machine-learning/Scene'),
        loadControls: () => import('@repo/radu-machine-learning/Controls'),
    },
    {
        id: 'randomart',
        label: 'Randomart',
        panelTitle: 'randomart',
        stageLabel: 'randomart',
        loadScene: () => import('@repo/randomart-ui/Scene'),
        loadControls: () => import('@repo/randomart-ui/Controls'),
    },
    {
        id: 'oeis-signal',
        label: 'oeis-signal',
        panelTitle: 'oeis-signal',
        stageLabel: 'oeis-signal',
        loadScene: () => import('@repo/oeis-signal/Scene'),
        loadControls: () => import('@repo/oeis-signal/Controls'),
    },
    {
        id: 'palette',
        label: 'Palette generator',
        panelTitle: 'Palette generator',
        stageLabel: 'Palette generator',
        loadScene: () => import('@repo/palette/Scene'),
        loadControls: () => import('@repo/palette/Controls'),
    },
    {
        id: 'pixel',
        label: 'pixel',
        panelTitle: 'Pixel docs',
        stageLabel: 'Pixel docs',
        loadScene: () => import('@repo/pixel/Scene'),
        loadControls: () => import('@repo/pixel/Controls'),
    },
    {
        id: 'pixel-manipulator',
        label: 'pixel-manipulator',
        panelTitle: 'Pixel manipulator',
        stageLabel: 'Pixel manipulator',
        loadScene: () => import('@repo/pixel-manipulator/Scene'),
        loadControls: () => import('@repo/pixel-manipulator/Controls'),
    },
    {
        id: 'notebook',
        label: 'Notebook',
        panelTitle: 'notebook controls',
        stageLabel: 'notebook',
        loadScene: () => import('@repo/notebook/Scene'),
        loadControls: () => import('@repo/notebook/Controls'),
    },
    {
        id: 'sequencer',
        label: 'sequencer',
        panelTitle: 'Sequencer',
        stageLabel: 'Sequencer',
        loadScene: () => import('@repo/sequencer/Scene'),
        loadControls: () => import('@repo/sequencer/Controls'),
    },
] as const satisfies readonly Experiment[];

// Derive the types directly from the registry.
export type ExperimentDefinition = (typeof EXPERIMENTS)[number];
export type ExperimentId = ExperimentDefinition['id'];

export const experimentsById = new Map<string, ExperimentDefinition>(
    EXPERIMENTS.map((experiment): [ExperimentId, ExperimentDefinition] => [
        experiment.id,
        experiment,
    ]),
);

export function getExperiment(id: string | undefined): ExperimentDefinition {
    return experimentsById.get(id ?? '') ?? EXPERIMENTS[0];
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

export function loadScene(experiment: ExperimentDefinition): Promise<SceneModule> {
    return cached(sceneCache, experiment.id, experiment.loadScene);
}

export function loadControls(experiment: ExperimentDefinition): Promise<ControlsModule> {
    return cached(controlsCache, experiment.id, experiment.loadControls);
}

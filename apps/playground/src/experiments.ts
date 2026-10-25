import type { StageProps } from '@repo/ui/components/Stage';
import type { ComponentType } from 'react';

export interface SceneModule {
    Scene: ComponentType;
    stageProps?: StageProps;
}

export interface ControlsModule {
    Controls: ComponentType;
}

export interface Experiment {
    readonly label: string;
    readonly panelTitle: string;
    readonly stageLabel: string;
    readonly loadScene: () => Promise<SceneModule>;
    readonly loadControls: () => Promise<ControlsModule>;
}

export const EXPERIMENTS = {
    home: {
        label: 'Home',
        panelTitle: 'home',
        stageLabel: 'home',
        loadScene: () => import('./components/home/Scene'),
        loadControls: () => import('./components/home/Controls'),
    },
    'art-canvas': {
        label: 'Art Canvas',
        panelTitle: 'art-canvas',
        stageLabel: 'art-canvas',
        loadScene: () => import('@repo/art-canvas/Scene'),
        loadControls: () => import('@repo/art-canvas/Controls'),
    },
    'mosaic-maker': {
        label: 'Mosaic Maker',
        panelTitle: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        loadScene: () => import('@repo/mosaic-maker/Scene'),
        loadControls: () => import('@repo/mosaic-maker/Controls'),
    },
    'mol-demo': {
        label: 'Mol Demo',
        panelTitle: 'mol-demo',
        stageLabel: 'mol-demo',
        loadScene: () => import('@repo/mol-demo/Scene'),
        loadControls: () => import('@repo/mol-demo/Controls'),
    },
    automa: {
        label: 'Automa',
        panelTitle: 'automa controls',
        stageLabel: 'automa',
        loadScene: () => import('@repo/automa/Scene'),
        loadControls: () => import('@repo/automa/Controls'),
    },
    fracture: {
        label: 'Fracture',
        panelTitle: 'fracture',
        stageLabel: 'fracture',
        loadScene: () => import('@repo/fracture/Scene'),
        loadControls: () => import('@repo/fracture/Controls'),
    },
    'radu-machine-learning': {
        label: 'radu-machine-learning',
        panelTitle: 'Radu machine learning',
        stageLabel: 'Radu machine learning',
        loadScene: () => import('@repo/radu-machine-learning/Scene'),
        loadControls: () => import('@repo/radu-machine-learning/Controls'),
    },
    randomart: {
        label: 'Randomart',
        panelTitle: 'randomart',
        stageLabel: 'randomart',
        loadScene: () => import('@repo/randomart/Scene'),
        loadControls: () => import('@repo/randomart/Controls'),
    },
    'oeis-signal': {
        label: 'oeis-signal',
        panelTitle: 'oeis-signal',
        stageLabel: 'oeis-signal',
        loadScene: () => import('@repo/oeis-signal/Scene'),
        loadControls: () => import('@repo/oeis-signal/Controls'),
    },
    palette: {
        label: 'Palette generator',
        panelTitle: 'Palette generator',
        stageLabel: 'Palette generator',
        loadScene: () => import('@repo/palette/Scene'),
        loadControls: () => import('@repo/palette/Controls'),
    },
    pixel: {
        label: 'pixel',
        panelTitle: 'Pixel docs',
        stageLabel: 'Pixel docs',
        loadScene: () => import('@repo/pixel/Scene'),
        loadControls: () => import('@repo/pixel/Controls'),
    },
    'pixel-manipulator': {
        label: 'pixel-manipulator',
        panelTitle: 'Pixel manipulator',
        stageLabel: 'Pixel manipulator',
        loadScene: () => import('@repo/pixel-manipulator/Scene'),
        loadControls: () => import('@repo/pixel-manipulator/Controls'),
    },
    sequencer: {
        label: 'sequencer',
        panelTitle: 'Sequencer',
        stageLabel: 'Sequencer',
        loadScene: () => import('@repo/sequencer/Scene'),
        loadControls: () => import('@repo/sequencer/Controls'),
    },
} as const satisfies Record<string, Experiment>;

export type ExperimentKey = keyof typeof EXPERIMENTS;
export const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];

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

const sceneCache = new Map<ExperimentKey, Promise<SceneModule>>();
const controlsCache = new Map<ExperimentKey, Promise<ControlsModule>>();

export function loadScene(key: ExperimentKey): Promise<SceneModule> {
    return cached(sceneCache, key, EXPERIMENTS[key].loadScene);
}

export function loadControls(key: ExperimentKey): Promise<ControlsModule> {
    const entry = EXPERIMENTS[key];
    return cached(controlsCache, key, entry.loadControls);
}

import type { ComponentPropsWithoutRef, ComponentType } from 'react';

import type { PageName } from './stores/appStore';

export type ExperimentId = Exclude<PageName, 'menu'>;

export interface SceneModule {
    Scene: ComponentType;
    stageProps?: Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'aria-label'>;
}

export interface ControlsModule {
    Controls: ComponentType;
}

export interface ExperimentEntry {
    id: ExperimentId;
    label: string;
    panelTitle: string;
    stageLabel: string;
    loadScene: () => Promise<SceneModule>;
    loadControls?: () => Promise<ControlsModule>;
}

export const EXPERIMENTS: Record<ExperimentId, ExperimentEntry> = {
    'art-canvas': {
        id: 'art-canvas',
        label: 'Art Canvas',
        panelTitle: 'art-canvas',
        stageLabel: 'art-canvas',
        loadScene: () => import('@repo/art-canvas/Scene'),
        loadControls: () => import('@repo/art-canvas/Controls'),
    },
    'mosaic-maker': {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        panelTitle: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        loadScene: () => import('@repo/mosaic-maker/Scene'),
        loadControls: () => import('@repo/mosaic-maker/Controls'),
    },
    'mol-demo': {
        id: 'mol-demo',
        label: 'Mol Demo',
        panelTitle: 'mol-demo',
        stageLabel: 'mol-demo',
        loadScene: () => import('@repo/mol-demo/Scene'),
        loadControls: () => import('@repo/mol-demo/Controls'),
    },
    automa: {
        id: 'automa',
        label: 'Automa',
        panelTitle: 'automa controls',
        stageLabel: 'automa',
        loadScene: () => import('@repo/automa/Scene'),
        loadControls: () => import('@repo/automa/Controls'),
    },
    fracture: {
        id: 'fracture',
        label: 'Fracture',
        panelTitle: 'fracture',
        stageLabel: 'fracture',
        loadScene: () => import('@repo/fracture/Scene'),
        loadControls: () => import('@repo/fracture/Controls'),
    },
};

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

function EmptyControls() {
    return null;
}

const EMPTY_CONTROLS: Promise<ControlsModule> = Promise.resolve({
    Controls: EmptyControls,
});

export { EMPTY_CONTROLS };

export function loadScene(id: ExperimentId): Promise<SceneModule> {
    return cached(sceneCache, id, EXPERIMENTS[id].loadScene);
}

export function loadControls(id: ExperimentId): Promise<ControlsModule> {
    const entry = EXPERIMENTS[id];
    if (!entry.loadControls) {
        return EMPTY_CONTROLS;
    }
    return cached(controlsCache, id, entry.loadControls);
}

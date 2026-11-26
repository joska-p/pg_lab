import type { StageProps } from '@repo/ui/components/ExperimentShell';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
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
    readonly panelTitle?: string;
    readonly stageLabel: string;
    readonly tint: ColorNames;
    readonly summary: string;
    readonly mark: string;
    readonly loadScene: () => Promise<SceneModule>;
    readonly loadControls?: () => Promise<ControlsModule>;
}

/** Metadata the Shell needs to render chrome, without requiring a Scene loader. */
export type ShellExperiment = Omit<Experiment, 'loadScene' | 'loadControls'>;

export const EXPERIMENTS = [
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        panelTitle: 'Art Canvas',
        stageLabel: 'art-canvas',
        tint: 'aurora',
        summary:
            'Un workbench dans le workbench : le plus versatile du registre. Le plus experimental aussi',
        mark: 'art-canvas',
        loadScene: () => import('@repo/art-canvas/Scene'),
        loadControls: () => import('@repo/art-canvas/Controls'),
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        panelTitle: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        tint: 'solder',
        summary: 'Un générateur de mosaïques plus ou moins aléatoire, à coups de « shuffle ».',
        mark: 'mosaic-maker',
        loadScene: () => import('@repo/mosaic-maker/Scene'),
        loadControls: () => import('@repo/mosaic-maker/Controls'),
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        panelTitle: 'Mol Demo',
        stageLabel: 'mol-demo',
        tint: 'aqua',
        summary:
            'Une molécule en 3D et son motif de diffraction. Vol sans honte du mol-demo.js de davidromano.dev.',
        mark: 'mol-demo',
        loadScene: () => import('@repo/mol-demo/Scene'),
        loadControls: () => import('@repo/mol-demo/Controls'),
    },
    {
        id: 'automa',
        label: 'Automa',
        panelTitle: 'Automa Controls',
        stageLabel: 'automa',
        tint: 'solder',
        summary:
            "Un automate cellulaire discret bricolé, pour faire tourner 'The Game of Life' de John Conway.",
        mark: 'automa',
        loadScene: () => import('@repo/automa/Scene'),
        loadControls: () => import('@repo/automa/Controls'),
    },
    {
        id: 'fracture',
        label: 'Fracture',
        panelTitle: 'Fracture',
        stageLabel: 'fracture',
        tint: 'purple',
        summary:
            "Un atelier de fractales et une collection de trucs pour repousser le zoom jusqu'à la limite.",
        mark: 'fracture',
        loadScene: () => import('@repo/fracture/Scene'),
        loadControls: () => import('@repo/fracture/Controls'),
    },
    {
        id: 'radu-machine-learning',
        label: 'Radu Machine Learning',
        panelTitle: 'Radu Machine Learning',
        stageLabel: 'Radu machine learning',
        tint: 'amber',
        summary: "Début d'implémentation du cours de machine learning de Radu.",
        mark: 'radu-machine-learning',
        loadScene: () => import('@repo/radu-machine-learning/Scene'),
        loadControls: () => import('@repo/radu-machine-learning/Controls'),
    },
    {
        id: 'randomart',
        label: 'Randomart',
        panelTitle: 'Randomart',
        stageLabel: 'randomart',
        tint: 'orange',
        summary:
            "Du Random Art d'après Tsoding et le papier de Perrig & Song : une graine donne une formule aléatoire, la formule donne une image.",
        mark: 'randomart',
        loadScene: () => import('@repo/randomart-ui/Scene'),
        loadControls: () => import('@repo/randomart-ui/Controls'),
    },
    {
        id: 'oeis-signal',
        label: 'OEIS Signal',
        panelTitle: 'OEIS Signal',
        stageLabel: 'oeis-signal',
        tint: 'aqua',
        summary: "Des suites de nombres de l'OEIS traitées comme des signaux.",
        mark: 'oeis-signal',
        loadScene: () => import('@repo/oeis-signal/Scene'),
        loadControls: () => import('@repo/oeis-signal/Controls'),
    },
    {
        id: 'palette',
        label: 'Palette Generator',
        panelTitle: 'Palette Generator',
        stageLabel: 'Palette generator',
        tint: 'aurora',
        summary:
            'Un générateur de palettes, avec un sélecteur qui travaille dans plusieurs espaces de couleur.',
        mark: 'palette',
        loadScene: () => import('@repo/palette/Scene'),
        loadControls: () => import('@repo/palette/Controls'),
    },
    {
        id: 'pixel',
        label: 'Pixel Docs',
        panelTitle: 'Pixel Docs',
        stageLabel: 'Pixel docs',
        tint: 'purple',
        summary: "La doc interactive d'un moteur de filtres d'image.",
        mark: 'pixel',
        loadScene: () => import('@repo/pixel/Scene'),
        loadControls: () => import('@repo/pixel/Controls'),
    },
    {
        id: 'pixel-manipulator',
        label: 'Pixel Manipulator',
        panelTitle: 'Pixel Manipulator',
        stageLabel: 'Pixel manipulator',
        tint: 'amber',
        summary: "Un manipulateur d'images par étapes, avec des presets et un comparateur.",
        mark: 'pixel-manipulator',
        loadScene: () => import('@repo/pixel-manipulator/Scene'),
        loadControls: () => import('@repo/pixel-manipulator/Controls'),
    },
    {
        id: 'notebook',
        label: 'Notebook',
        panelTitle: 'Notebook Controls',
        stageLabel: 'notebook',
        tint: 'aqua',
        summary: 'Des notes en vrac et ce qui ne va pas ailleurs.',
        mark: 'notebook',
        loadScene: () => import('@repo/notebook/Scene'),
        loadControls: () => import('@repo/notebook/Controls'),
    },
    {
        id: 'sequencer',
        label: 'Sequencer',
        panelTitle: 'Sequencer',
        stageLabel: 'Sequencer',
        tint: 'orange',
        summary:
            'Première tentative pour visualiser des algorithmes : je sépare la suite de la visualisation, sans trop savoir quoi en faire, encore un prétexte pour apprendre à coder.',
        mark: 'sequencer',
        loadScene: () => import('@repo/sequencer/Scene'),
        loadControls: () => import('@repo/sequencer/Controls'),
    },
] as const satisfies readonly Experiment[];

// Derive the ids from the registry, then use the interface so optional fields stay visible.
export type ExperimentId = (typeof EXPERIMENTS)[number]['id'];
export type ExperimentDefinition = Experiment<ExperimentId>;

export const experimentCount = EXPERIMENTS.length;
export const interactiveExperiments: readonly ExperimentDefinition[] = EXPERIMENTS;

export function experimentPath(experiment: Experiment): string {
    return `/${experiment.id}`;
}

export const experimentsById = new Map<string, ExperimentDefinition>(
    EXPERIMENTS.map((experiment): [ExperimentId, ExperimentDefinition] => [
        experiment.id,
        experiment,
    ]),
);

export function getExperiment(id: string | undefined): ExperimentDefinition | undefined {
    return id === undefined ? undefined : experimentsById.get(id);
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

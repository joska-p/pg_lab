import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import type { ComponentType } from 'react';

export interface ExperimentComponentProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export interface ExperimentModule {
    Experiment: ComponentType<ExperimentComponentProps>;
}

export interface Experiment<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
    readonly stageLabel: string;
    readonly tint: ColorNames;
    readonly summary: string;
    readonly mark: string;
    readonly loadExperiment: () => Promise<ExperimentModule>;
}

/** Metadata the Shell needs to render chrome, without requiring an Experiment loader. */
export type ShellExperiment = Omit<Experiment, 'loadExperiment'>;

export const EXPERIMENTS = [
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        stageLabel: 'art-canvas',
        tint: 'aurora',
        summary:
            'Un workbench dans le workbench : le plus versatile du registre. Le plus experimental aussi',
        mark: 'art-canvas',
        loadExperiment: () => import('@repo/art-canvas/Experiment'),
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        tint: 'solder',
        summary: 'Un générateur de mosaïques plus ou moins aléatoire, à coups de « shuffle ».',
        mark: 'mosaic-maker',
        loadExperiment: () => import('@repo/mosaic-maker/Experiment'),
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        stageLabel: 'mol-demo',
        tint: 'aqua',
        summary:
            'Une molécule en 3D et son motif de diffraction. Vol sans honte du mol-demo.js de davidromano.dev.',
        mark: 'mol-demo',
        loadExperiment: () => import('@repo/mol-demo/Experiment'),
    },
    {
        id: 'automa',
        label: 'Automa',
        stageLabel: 'automa',
        tint: 'solder',
        summary:
            "Un automate cellulaire discret bricolé, pour faire tourner 'The Game of Life' de John Conway.",
        mark: 'automa',
        loadExperiment: () => import('@repo/automa/Experiment'),
    },
    {
        id: 'fracture',
        label: 'Fracture',
        stageLabel: 'fracture',
        tint: 'purple',
        summary:
            "Un atelier de fractales et une collection de trucs pour repousser le zoom jusqu'à la limite.",
        mark: 'fracture',
        loadExperiment: () => import('@repo/fracture/Experiment'),
    },
    {
        id: 'radu-machine-learning',
        label: 'Radu Machine Learning',
        stageLabel: 'Radu machine learning',
        tint: 'amber',
        summary: "Début d'implémentation du cours de machine learning de Radu.",
        mark: 'radu-machine-learning',
        loadExperiment: () => import('@repo/radu-machine-learning/Experiment'),
    },
    {
        id: 'randomart',
        label: 'Randomart',
        stageLabel: 'randomart',
        tint: 'orange',
        summary:
            "Du Random Art d'après Tsoding et le papier de Perrig & Song : une graine donne une formule aléatoire, la formule donne une image.",
        mark: 'randomart',
        loadExperiment: () => import('@repo/randomart-ui/Experiment'),
    },
    {
        id: 'oeis-signal',
        label: 'OEIS Signal',
        stageLabel: 'oeis-signal',
        tint: 'aqua',
        summary: "Des suites de nombres de l'OEIS traitées comme des signaux.",
        mark: 'oeis-signal',
        loadExperiment: () => import('@repo/oeis-signal/Experiment'),
    },
    {
        id: 'palette',
        label: 'Palette Generator',
        stageLabel: 'Palette generator',
        tint: 'aurora',
        summary:
            'Un générateur de palettes, avec un sélecteur qui travaille dans plusieurs espaces de couleur.',
        mark: 'palette',
        loadExperiment: () => import('@repo/palette/Experiment'),
    },
    {
        id: 'pixel',
        label: 'Pixel Docs',
        stageLabel: 'Pixel docs',
        tint: 'purple',
        summary: "La doc interactive d'un moteur de filtres d'image.",
        mark: 'pixel',
        loadExperiment: () => import('@repo/pixel/Experiment'),
    },
    {
        id: 'pixel-manipulator',
        label: 'Pixel Manipulator',
        stageLabel: 'Pixel manipulator',
        tint: 'amber',
        summary: "Un manipulateur d'images par étapes, avec des presets et un comparateur.",
        mark: 'pixel-manipulator',
        loadExperiment: () => import('@repo/pixel-manipulator/Experiment'),
    },
    {
        id: 'notebook',
        label: 'Notebook',
        stageLabel: 'notebook',
        tint: 'aqua',
        summary: 'Des notes en vrac et ce qui ne va pas ailleurs.',
        mark: 'notebook',
        loadExperiment: () => import('@repo/notebook/Experiment'),
    },
    {
        id: 'sequencer',
        label: 'Sequencer',
        stageLabel: 'Sequencer',
        tint: 'orange',
        summary:
            'Première tentative pour visualiser des algorithmes : je sépare la suite de la visualisation, sans trop savoir quoi en faire, encore un prétexte pour apprendre à coder.',
        mark: 'sequencer',
        loadExperiment: () => import('@repo/sequencer/Experiment'),
    },
    {
        id: 'three-stage',
        label: 'three-stage',
        stageLabel: 'three-stage',
        tint: 'aurora',
        summary: 'Atelier Threejs et r3f.',
        mark: 'three-stage',
        loadExperiment: () => import('@repo/three-stage/Experiment'),
    },
] as const satisfies readonly Experiment[];

// Derive the ids from the registry, then use the interface so optional fields stay visible.
type ExperimentId = (typeof EXPERIMENTS)[number]['id'];
export type ExperimentDefinition = Experiment<ExperimentId>;

export const experimentCount = EXPERIMENTS.length;

export function experimentPath(experiment: Experiment): string {
    return `/${experiment.id}`;
}

const experimentsById = new Map<string, ExperimentDefinition>(
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

const experimentCache = new Map<ExperimentId, Promise<ExperimentModule>>();

export function loadExperiment(experiment: ExperimentDefinition): Promise<ExperimentModule> {
    return cached(experimentCache, experiment.id, experiment.loadExperiment);
}

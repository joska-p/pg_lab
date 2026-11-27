import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import type { ComponentType } from 'react';

/** Minimal metadata needed by the Workbench to render a Page's chrome. */
export interface PageMeta {
    readonly id: string;
    readonly label: string;
    readonly stageLabel: string;
    readonly tint: ColorNames;
    readonly mark: string;
}

export interface ExperimentProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export interface ExperimentModule {
    Experiment: ComponentType<ExperimentProps>;
}

interface ExperimentEntryShape<TId extends string = string> extends PageMeta {
    readonly id: TId;
    readonly summary: string;
    readonly load: () => Promise<ExperimentModule>;
}

export const EXPERIMENTS = [
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        stageLabel: 'art-canvas',
        tint: 'aurora',
        summary:
            'Un workbench dans le workbench : le plus versatile du registre. Le plus experimental aussi',
        mark: 'art-canvas',
        load: () => import('@repo/art-canvas/Experiment'),
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        tint: 'solder',
        summary: 'Un générateur de mosaïques plus ou moins aléatoire, à coups de « shuffle ».',
        mark: 'mosaic-maker',
        load: () => import('@repo/mosaic-maker/Experiment'),
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        stageLabel: 'mol-demo',
        tint: 'aqua',
        summary:
            'Une molécule en 3D et son motif de diffraction. Vol sans honte du mol-demo.js de davidromano.dev.',
        mark: 'mol-demo',
        load: () => import('@repo/mol-demo/Experiment'),
    },
    {
        id: 'automa',
        label: 'Automa',
        stageLabel: 'automa',
        tint: 'solder',
        summary:
            "Un automate cellulaire discret bricolé, pour faire tourner 'The Game of Life' de John Conway.",
        mark: 'automa',
        load: () => import('@repo/automa/Experiment'),
    },
    {
        id: 'fracture',
        label: 'Fracture',
        stageLabel: 'fracture',
        tint: 'purple',
        summary:
            "Un atelier de fractales et une collection de trucs pour repousser le zoom jusqu'à la limite.",
        mark: 'fracture',
        load: () => import('@repo/fracture/Experiment'),
    },
    {
        id: 'radu-machine-learning',
        label: 'Radu Machine Learning',
        stageLabel: 'Radu machine learning',
        tint: 'amber',
        summary: "Début d'implémentation du cours de machine learning de Radu.",
        mark: 'radu-machine-learning',
        load: () => import('@repo/radu-machine-learning/Experiment'),
    },
    {
        id: 'randomart',
        label: 'Randomart',
        stageLabel: 'randomart',
        tint: 'orange',
        summary:
            "Du Random Art d'après Tsoding et le papier de Perrig & Song : une graine donne une formule aléatoire, la formule donne une image.",
        mark: 'randomart',
        load: () => import('@repo/randomart-ui/Experiment'),
    },
    {
        id: 'oeis-signal',
        label: 'OEIS Signal',
        stageLabel: 'oeis-signal',
        tint: 'aqua',
        summary: "Des suites de nombres de l'OEIS traitées comme des signaux.",
        mark: 'oeis-signal',
        load: () => import('@repo/oeis-signal/Experiment'),
    },
    {
        id: 'palette',
        label: 'Palette Generator',
        stageLabel: 'Palette generator',
        tint: 'aurora',
        summary:
            'Un générateur de palettes, avec un sélecteur qui travaille dans plusieurs espaces de couleur.',
        mark: 'palette',
        load: () => import('@repo/palette/Experiment'),
    },
    {
        id: 'pixel',
        label: 'Pixel Docs',
        stageLabel: 'Pixel docs',
        tint: 'purple',
        summary: "La doc interactive d'un moteur de filtres d'image.",
        mark: 'pixel',
        load: () => import('@repo/pixel/Experiment'),
    },
    {
        id: 'pixel-manipulator',
        label: 'Pixel Manipulator',
        stageLabel: 'Pixel manipulator',
        tint: 'amber',
        summary: "Un manipulateur d'images par étapes, avec des presets et un comparateur.",
        mark: 'pixel-manipulator',
        load: () => import('@repo/pixel-manipulator/Experiment'),
    },
    {
        id: 'notebook',
        label: 'Notebook',
        stageLabel: 'notebook',
        tint: 'aqua',
        summary: 'Des notes en vrac et ce qui ne va pas ailleurs.',
        mark: 'notebook',
        load: () => import('@repo/notebook/Experiment'),
    },
    {
        id: 'sequencer',
        label: 'Sequencer',
        stageLabel: 'Sequencer',
        tint: 'orange',
        summary:
            'Première tentative pour visualiser des algorithmes : je sépare la suite de la visualisation, sans trop savoir quoi en faire, encore un prétexte pour apprendre à coder.',
        mark: 'sequencer',
        load: () => import('@repo/sequencer/Experiment'),
    },
    {
        id: 'three-stage',
        label: 'three-stage',
        stageLabel: 'three-stage',
        tint: 'aurora',
        summary: 'Atelier Threejs et r3f.',
        mark: 'three-stage',
        load: () => import('@repo/three-stage/Experiment'),
    },
] as const satisfies readonly ExperimentEntryShape[];

// Derive the ids from the registry, then specialize the entry type with the union of known ids.
export type ExperimentId = (typeof EXPERIMENTS)[number]['id'];
export type ExperimentEntry = ExperimentEntryShape<ExperimentId>;

export const experimentCount = EXPERIMENTS.length;

export function experimentPath(entry: ExperimentEntry): string {
    return `/${entry.id}`;
}

const experimentsById = new Map<string, ExperimentEntry>(
    EXPERIMENTS.map((entry): [ExperimentId, ExperimentEntry] => [entry.id, entry]),
);

export function getExperiment(id: string | undefined): ExperimentEntry | undefined {
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

export function loadExperiment(entry: ExperimentEntry): Promise<ExperimentModule> {
    return cached(experimentCache, entry.id, entry.load);
}

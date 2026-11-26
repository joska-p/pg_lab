import { lazy } from 'react';
import type { ComponentType } from 'react';

interface Experiment<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
    readonly Scene: ComponentType;
    readonly Controls: ComponentType | null;
}

const EXPERIMENTS = [
    {
        id: 'draw',
        label: 'Draw',
        Scene: lazy(() =>
            import('./modules/draw/DrawCanvas').then((m) => ({
                default: m.DrawCanvas,
            })),
        ),
        Controls: null,
    },

    {
        id: 'spirale',
        label: 'Spirale',
        Scene: lazy(() =>
            import('./modules/spirale/Spirale').then((m) => ({
                default: m.Spirale,
            })),
        ),
        Controls: lazy(() =>
            import('./modules/spirale/SpiraleControls').then((m) => ({
                default: m.SpiraleControls,
            })),
        ),
    },
    {
        id: 'seed',
        label: 'Seed',
        Scene: lazy(() =>
            import('./modules/seed/SeedCanvas').then((m) => ({
                default: m.SeedCanvas,
            })),
        ),
        Controls: lazy(() =>
            import('./modules/seed/SeedControls').then((m) => ({
                default: m.SeedControls,
            })),
        ),
    },
    {
        id: 'folded-space',
        label: 'Folded space',
        Scene: lazy(() =>
            import('./modules/folded-space/FoldedSpace').then((m) => ({
                default: m.FoldedSpace,
            })),
        ),
        Controls: () => null,
    },
    {
        id: 'atlas',
        label: 'Atlas',
        Scene: lazy(() =>
            import('./modules/atlas/Atlas').then((m) => ({
                default: m.Atlas,
            })),
        ),
        Controls: lazy(() =>
            import('./modules/atlas/AtlasControls').then((m) => ({
                default: m.AtlasControls,
            })),
        ),
    },
    {
        id: 'manual',
        label: 'Manual',
        Scene: lazy(() =>
            import('./modules/manual/Manual').then((m) => ({
                default: m.Manual,
            })),
        ),
        Controls: lazy(() =>
            import('./modules/manual/ManualControls').then((m) => ({
                default: m.ManualControls,
            })),
        ),
    },
] as const satisfies readonly Experiment[];

// Derive types directly from the registry.
export type ExperimentDefinition = (typeof EXPERIMENTS)[number];
export type ExperimentKey = ExperimentDefinition['id'];

// Index experiments by ID for direct lookup.
const experimentsById = new Map<string, ExperimentDefinition>(
    EXPERIMENTS.map((experiment) => [experiment.id, experiment]),
);

// The registry reports absence; callers own the UX default.
export const DEFAULT_EXPERIMENT = EXPERIMENTS[0];

// Resolve an experiment from an external identifier.
export function getExperiment(id: string | undefined): ExperimentDefinition | undefined {
    return experimentsById.get(id ?? '');
}

// Select options derived from the registry.
export const experimentOptions = EXPERIMENTS.map(({ id, label }) => ({
    value: id,
    label,
}));

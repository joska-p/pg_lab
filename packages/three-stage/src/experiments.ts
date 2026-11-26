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
        id: 'getStarted',
        label: 'Get started',
        Scene: lazy(() =>
            import('./components/getStarted/GetStarted').then((m) => ({
                default: m.GetStarted,
            })),
        ),
        Controls: null,
    },

    {
        id: 'stage',
        label: 'Stage',
        Scene: lazy(() =>
            import('./components/stage/Stage').then((m) => ({
                default: m.Stage,
            })),
        ),
        Controls: null,
    },
] as const satisfies readonly Experiment[];

// Derive types directly from the registry.
export type ExperimentDefinition = (typeof EXPERIMENTS)[number];
export type ExperimentKey = ExperimentDefinition['id'];

// Index experiments by ID for direct lookup.
const experimentsById = new Map<string, ExperimentDefinition>(
    EXPERIMENTS.map((experiment) => [experiment.id, experiment]),
);

// Resolve an experiment from an external identifier.
export function getExperiment(id: string | undefined): ExperimentDefinition {
    return experimentsById.get(id ?? '') ?? EXPERIMENTS[0];
}

// Select options derived from the registry.
export const experimentOptions = EXPERIMENTS.map(({ id, label }) => ({
    value: id,
    label,
}));

import type { ComponentType } from 'react';

import {
    JuliaDoubleSplit,
    JuliaDoubleSplitControls,
} from './modules/julia-double-split/experiment';
import {
    Julia as JuliaNaive,
    JuliaControls as JuliaNaiveControls,
} from './modules/julia/experiment';
import { DoubleSplit, DoubleSplitControls } from './modules/mandelbrot-double-split/experiment';
import { Naive, NaiveControls } from './modules/mandelbrot-naive/experiment';
import { Perturbation, PerturbationControls } from './modules/mandelbrot-perturbation/experiment';

export interface Experiment<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
    readonly Scene: ComponentType;
    readonly Controls: ComponentType;
}

export const EXPERIMENTS = [
    {
        id: 'mandelbrot-naive',
        label: 'Mandelbrot · Naive',
        Scene: Naive,
        Controls: NaiveControls,
    },
    {
        id: 'mandelbrot-double-split',
        label: 'Mandelbrot · Double-split',
        Scene: DoubleSplit,
        Controls: DoubleSplitControls,
    },
    {
        id: 'mandelbrot-perturbation',
        label: 'Mandelbrot · Perturbation',
        Scene: Perturbation,
        Controls: PerturbationControls,
    },
    {
        id: 'julia-naive',
        label: 'Julia · Naive',
        Scene: JuliaNaive,
        Controls: JuliaNaiveControls,
    },
    {
        id: 'julia-double-split',
        label: 'Julia · Double-split',
        Scene: JuliaDoubleSplit,
        Controls: JuliaDoubleSplitControls,
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

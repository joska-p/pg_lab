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

export interface Experiment {
    readonly label: string;
    readonly Scene: ComponentType;
    readonly Controls: ComponentType;
}

export const EXPERIMENTS = {
    'mandelbrot-naive': {
        label: 'Mandelbrot · Naive',
        Scene: Naive,
        Controls: NaiveControls,
    },
    'mandelbrot-double-split': {
        label: 'Mandelbrot · Double-split',
        Scene: DoubleSplit,
        Controls: DoubleSplitControls,
    },
    'mandelbrot-perturbation': {
        label: 'Mandelbrot · Perturbation',
        Scene: Perturbation,
        Controls: PerturbationControls,
    },
    'julia-naive': {
        label: 'Julia · Naive',
        Scene: JuliaNaive,
        Controls: JuliaNaiveControls,
    },
    'julia-double-split': {
        label: 'Julia · Double-split',
        Scene: JuliaDoubleSplit,
        Controls: JuliaDoubleSplitControls,
    },
} as const satisfies Record<string, Experiment>;

export type ExperimentKey = keyof typeof EXPERIMENTS;
export const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];

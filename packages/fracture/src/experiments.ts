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

export type ExperimentId =
    | 'mandelbrot-naive'
    | 'mandelbrot-double-split'
    | 'mandelbrot-perturbation'
    | 'julia-naive'
    | 'julia-double-split';

export interface WorkshopExperiment {
    label: string;
    Canvas: ComponentType;
    Controls?: ComponentType;
}

export const EXPERIMENTS: Record<ExperimentId, WorkshopExperiment> = {
    'mandelbrot-naive': {
        label: 'Mandelbrot · Naive',
        Canvas: Naive,
        Controls: NaiveControls,
    },
    'mandelbrot-double-split': {
        label: 'Mandelbrot · Double-split',
        Canvas: DoubleSplit,
        Controls: DoubleSplitControls,
    },
    'mandelbrot-perturbation': {
        label: 'Mandelbrot · Perturbation',
        Canvas: Perturbation,
        Controls: PerturbationControls,
    },
    'julia-naive': {
        label: 'Julia · Naive',
        Canvas: JuliaNaive,
        Controls: JuliaNaiveControls,
    },
    'julia-double-split': {
        label: 'Julia · Double-split',
        Canvas: JuliaDoubleSplit,
        Controls: JuliaDoubleSplitControls,
    },
};

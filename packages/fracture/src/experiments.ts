import type { ComponentType } from 'react';

import { DoubleSplit, DoubleSplitControls } from './modules/mandelbrot-double-split/experiment';
import { Naive, NaiveControls } from './modules/mandelbrot-naive/experiment';
import { Perturbation, PerturbationControls } from './modules/mandelbrot-perturbation/experiment';

export type ExperimentId =
    | 'mandelbrot-naive'
    | 'mandelbrot-double-split'
    | 'mandelbrot-perturbation';

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
};

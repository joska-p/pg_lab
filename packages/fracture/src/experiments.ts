import type { ComponentType } from 'react';

import { Mandelbrot, MandelbrotControls } from './modules/mandelbrot/experiment';

export type ExperimentId = 'mandelbrot';

export interface WorkshopExperiment {
    label: string;
    Canvas: ComponentType;
    Controls?: ComponentType;
}

export const EXPERIMENTS: Record<ExperimentId, WorkshopExperiment> = {
    mandelbrot: {
        label: 'Mandelbrot',
        Canvas: Mandelbrot,
        Controls: MandelbrotControls,
    },
};

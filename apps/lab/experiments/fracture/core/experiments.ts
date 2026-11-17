/*
 * Experiment registry for the static fracture page.
 *
 * The React original registered lazy scene/control components. Here the only
 * per-experiment data is metadata plus the assembled fragment source; the
 * panel markup is shared and simply shows or hides the Julia constant fields.
 */

import juliaDoubleSplitBody from './modules/julia-double-split/julia.glsl?raw';
import juliaBody from './modules/julia/julia.glsl?raw';
import doubleSplitBody from './modules/mandelbrot-double-split/double-split.glsl?raw';
import naiveBody from './modules/mandelbrot-naive/naive.glsl?raw';
import perturbationBody from './modules/mandelbrot-perturbation/perturbation.glsl?raw';
import { assemble } from './shaders/assemble';
import dsArithmeticChunk from './shaders/chunks/ds-arithmetic.glsl?raw';
import lightingChunk from './shaders/chunks/lighting.glsl?raw';
import oklchChunk from './shaders/chunks/oklch.glsl?raw';

export type ExperimentId =
    | 'mandelbrot-naive'
    | 'mandelbrot-double-split'
    | 'mandelbrot-perturbation'
    | 'julia-naive'
    | 'julia-double-split';

export interface ExperimentDefinition {
    readonly id: ExperimentId;
    readonly label: string;
    /** Camera ceiling of the numeric tier (float32, double-single, perturbation). */
    readonly maxZoom: number;
    readonly fragment: string;
    readonly hasJuliaConstant: boolean;
}

const naiveExperiment: ExperimentDefinition = {
    id: 'mandelbrot-naive',
    label: 'Mandelbrot · Naive',
    maxZoom: 1e6,
    fragment: assemble(oklchChunk, lightingChunk, naiveBody),
    hasJuliaConstant: false,
};

export const EXPERIMENTS = [
    naiveExperiment,
    {
        id: 'mandelbrot-double-split',
        label: 'Mandelbrot · Double-split',
        maxZoom: 1e11,
        fragment: assemble(dsArithmeticChunk, oklchChunk, lightingChunk, doubleSplitBody),
        hasJuliaConstant: false,
    },
    {
        id: 'mandelbrot-perturbation',
        label: 'Mandelbrot · Perturbation',
        maxZoom: 1e15,
        fragment: assemble(dsArithmeticChunk, oklchChunk, lightingChunk, perturbationBody),
        hasJuliaConstant: false,
    },
    {
        id: 'julia-naive',
        label: 'Julia · Naive',
        maxZoom: 1e6,
        fragment: assemble(oklchChunk, lightingChunk, juliaBody),
        hasJuliaConstant: true,
    },
    {
        id: 'julia-double-split',
        label: 'Julia · Double-split',
        maxZoom: 1e11,
        fragment: assemble(dsArithmeticChunk, oklchChunk, lightingChunk, juliaDoubleSplitBody),
        hasJuliaConstant: true,
    },
] as const satisfies readonly ExperimentDefinition[];

export const DEFAULT_EXPERIMENT: ExperimentDefinition = naiveExperiment;

export const EXPERIMENT_OPTIONS = EXPERIMENTS.map(({ id, label }) => ({ value: id, label }));

export function getExperiment(id: string): ExperimentDefinition {
    return EXPERIMENTS.find((experiment) => experiment.id === id) ?? DEFAULT_EXPERIMENT;
}

export function isExperimentId(value: string): value is ExperimentId {
    return EXPERIMENTS.some((experiment) => experiment.id === value);
}

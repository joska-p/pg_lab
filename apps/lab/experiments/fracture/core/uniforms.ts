/*
 * Uniform builders lifted from the five scene components. They are pure apart
 * from the perturbation runtime (which owns GPU orbit textures), so the static
 * page can reuse them verbatim: one provider function feeds the single
 * compiled program currently installed in GpuStage.
 */

import type { UniformValue } from '../../../lib/surface/gpu/index';
import { WORLD_SCALE } from './camera';
import { splitDouble } from './doubleSplit';
import { computeMaxIterations } from './iterationPolicy';
import type { FractalParams } from './params';
import type { PerturbationRuntime } from './perturbationRuntime';

export interface CameraView {
    x: number;
    y: number;
    zoom: number;
}

export function naiveUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    // Normalize the camera pan by zoom and canvas size into UV space. The shader
    // applies u_panOffset after zoom, and a drag offset moves content opposite the
    // cursor, so x is negated. The −0.5·drift terms pin the anchor to screenToWorld
    // across zoom: the shader's (uv − 0.5) reference sits inside the /zoom divide.
    const panNormX = view.x / view.zoom / width;
    const panNormY = view.y / view.zoom / height;
    const drift = 1.0 - 1.0 / view.zoom;

    return {
        u_camera: [view.x, view.y, view.zoom],
        u_panOffset: [-panNormX - 0.5 * drift, panNormY + 0.5 * drift],
        u_aspect: width / height,
        u_iterationBase: params.iterationBase,
        u_iterationScale: params.iterationScale,
        u_iterationCap: params.iterationCap,
        u_interiorScale: params.interiorScale,
        u_pixelEps: params.pixelEps,
        u_sunAngle: params.sunAngle,
        u_bumpHeight: params.bumpHeight,
        u_ambient: params.ambientLight,
        u_hueShift: params.hueShift,
        u_hueFrequency: params.hueFrequency,
        u_chromaScale: params.chromaScale,
    };
}

/** Complex-plane center used by the double-split and perturbation shader conventions. */
function complexCenter(
    view: CameraView,
    width: number,
    height: number,
): { centerRe: number; centerIm: number } {
    const panNormX = view.x / view.zoom / width;
    const panNormY = view.y / view.zoom / height;
    const aspect = width / height;
    const drift = 1.0 - 1.0 / view.zoom;

    return {
        centerRe: -WORLD_SCALE * aspect * panNormX - 0.5 - 0.5 * WORLD_SCALE * aspect * drift,
        centerIm: WORLD_SCALE * panNormY + 0.5 * WORLD_SCALE * drift,
    };
}

export function doubleSplitUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    const aspect = width / height;
    const { centerRe, centerIm } = complexCenter(view, width, height);
    const [centerReHi, centerReLo] = splitDouble(centerRe);
    const [centerImHi, centerImLo] = splitDouble(centerIm);

    return {
        u_camera: [view.x, view.y, view.zoom],
        u_aspect: aspect,
        u_centerRe: [centerReHi, centerReLo],
        u_centerIm: [centerImHi, centerImLo],
        u_iterationBase: params.iterationBase,
        u_iterationScale: params.iterationScale,
        u_iterationCap: params.iterationCap,
        u_interiorScale: params.interiorScale,
        u_pixelEps: params.pixelEps,
        u_sunAngle: params.sunAngle,
        u_bumpHeight: params.bumpHeight,
        u_ambient: params.ambientLight,
        u_hueShift: params.hueShift,
        u_hueFrequency: params.hueFrequency,
        u_chromaScale: params.chromaScale,
    };
}

export function juliaUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    return {
        ...naiveUniforms(params, view, width, height),
        u_juliaRe: params.juliaRe,
        u_juliaIm: params.juliaIm,
    };
}

export function juliaDoubleSplitUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    return {
        ...doubleSplitUniforms(params, view, width, height),
        u_juliaRe: params.juliaRe,
        u_juliaIm: params.juliaIm,
    };
}

export function perturbationUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
    runtime: PerturbationRuntime,
): Record<string, UniformValue> {
    const aspect = width / height;
    const { centerRe, centerIm } = complexCenter(view, width, height);
    const viewScale = WORLD_SCALE / view.zoom;
    const maxIterations = computeMaxIterations(
        view.zoom,
        params.iterationBase,
        params.iterationScale,
        params.iterationCap,
    );

    runtime.update(centerRe, centerIm, view.zoom, viewScale, maxIterations);

    const orbits = runtime.orbits;
    const textures = runtime.textures;

    if (!orbits || !textures) {
        return {};
    }

    const [scaleHi, scaleLo] = splitDouble(viewScale);

    return {
        u_camera: [view.x, view.y, view.zoom],
        u_aspect: aspect,
        u_scale: [scaleHi, scaleLo],

        u_orbit: textures.tex1,
        u_orbitLength: orbits.primary.orbitLength,
        u_referenceIterations: orbits.primary.referenceIterations,

        u_orbit2: textures.tex2,
        u_orbitLength2: orbits.secondary.orbitLength,
        u_referenceIterations2: orbits.secondary.referenceIterations,

        u_interiorScale: params.interiorScale,
        u_pixelEps: params.pixelEps,
        u_sunAngle: params.sunAngle,
        u_bumpHeight: params.bumpHeight,
        u_ambient: params.ambientLight,
        u_hueShift: params.hueShift,
        u_hueFrequency: params.hueFrequency,
        u_chromaScale: params.chromaScale,
    };
}

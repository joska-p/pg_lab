import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import { useEffect, useRef, type RefObject } from 'react';

import { ZOOM_WHEEL_SPEED } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { createOrbitTextures, type OrbitTextures } from '../../core/orbitTextures';
import {
    computeReferenceOrbit,
    computeSecondaryOrbit,
    type ReferenceOrbit,
} from '../../core/referenceOrbit';
import doubleSplitShader from '../../shaders/mandelbrot/double-split.glsl?raw';
import naiveShader from '../../shaders/mandelbrot/naive.glsl?raw';
import perturbationShader from '../../shaders/mandelbrot/perturbation.glsl?raw';
import {
    mandelbrotStore,
    setMandelbrotSurface,
    useMandelbrotPrecision,
    useMandelbrotSurface,
    type MandelbrotPrecision,
} from '../../stores/mandelbrotStore';
import { useParams, type FractalParams } from '../../stores/paramStore';
import { fractalParamsUniforms } from './fractalUniforms';

/**
 * One shared camera per experiment across precision modes (D2): glaze clamps the zoom of every
 * precision to this single ceiling. Naive float32 degrades honestly far below it — that is the
 * comparison value the workshop exists for.
 */
const MAX_ZOOM = 1e15;

// Complex-plane width of the view at zoom = 1. The shaders map (uv − 0.5) · (3 / zoom) onto the
// complex plane, so both the double-split centre and the perturbation deltas use this fixed width.
const WORLD_SCALE = 3.0;

interface CameraView {
    x: number;
    y: number;
    zoom: number;
}

interface Orbits {
    primary: ReferenceOrbit;
    secondary: ReferenceOrbit;
}

/** Per-frame canvas + the component-owned refs the perturbation provider mutates. */
interface PerturbationRuntime {
    canvas: HTMLCanvasElement;
    texturesRef: RefObject<OrbitTextures | null>;
    orbitsRef: RefObject<Orbits | null>;
    lastCenterReRef: RefObject<number>;
    lastCenterImRef: RefObject<number>;
    lastZoomRef: RefObject<number>;
}

function naiveUniforms(
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
        u_panOffset: [-panNormX - 0.5 * drift, panNormY + 0.5 * drift],
        ...fractalParamsUniforms(params),
    };
}

function doubleSplitUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    // Map the interaction camera onto the complex-plane center the double-split shader expects.
    // With its convention  c = (uvCoord − 0.5) · (3 / zoom) + center, the center is
    // (−WORLD_SCALE·aspect·panNormX − 0.5 − 0.5·WORLD_SCALE·aspect·drift,
    //  WORLD_SCALE·panNormY + 0.5·WORLD_SCALE·drift); the drift terms pin the anchor to
    // screenToWorld across zoom.
    const panNormX = view.x / view.zoom / width;
    const panNormY = view.y / view.zoom / height;
    const aspect = width / height;
    const drift = 1.0 - 1.0 / view.zoom;
    const centerRe = -WORLD_SCALE * aspect * panNormX - 0.5 - 0.5 * WORLD_SCALE * aspect * drift;
    const centerIm = WORLD_SCALE * panNormY + 0.5 * WORLD_SCALE * drift;

    // Split each float64 center component into a double-single (hi, lo) pair of float32s (~48 bits)
    // before uploading, so the GPU keeps the center exact at zoom levels far beyond float32.
    const [centerReHi, centerReLo] = splitDouble(centerRe);
    const [centerImHi, centerImLo] = splitDouble(centerIm);

    return {
        u_centerRe: [centerReHi, centerReLo],
        u_centerIm: [centerImHi, centerImLo],
        ...fractalParamsUniforms(params),
    };
}

function perturbationUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
    runtime: PerturbationRuntime,
): Record<string, UniformValue> {
    const { canvas, texturesRef, orbitsRef, lastCenterReRef, lastCenterImRef, lastZoomRef } =
        runtime;

    // Same camera → complex-plane mapping as double-split: the view centre uses the fixed
    // zoom = 1 width (WORLD_SCALE); viewScale is the per-frame width driving the per-pixel
    // delta and the reference-orbit spacing.
    const panNormX = view.x / view.zoom / width;
    const panNormY = view.y / view.zoom / height;
    const aspect = width / height;
    const drift = 1.0 - 1.0 / view.zoom;
    const centerRe = -panNormX * WORLD_SCALE * aspect - 0.5 - 0.5 * WORLD_SCALE * aspect * drift;
    const centerIm = panNormY * WORLD_SCALE + 0.5 * WORLD_SCALE * drift;
    const viewScale = WORLD_SCALE / view.zoom;

    // Lazily bind the orbit textures to the glaze-owned GL context (the first frame runs only
    // once the runtime is live); the texture object keeps its own gl across context restores.
    let textures = texturesRef.current;

    if (!textures) {
        const gl = canvas.getContext('webgl2');

        if (!gl) {
            return {};
        }

        textures = createOrbitTextures(gl);
        texturesRef.current = textures;
    }

    // NaN sentinels guarantee the first visible frame always computes an orbit.
    const viewChanged =
        centerRe !== lastCenterReRef.current ||
        centerIm !== lastCenterImRef.current ||
        view.zoom !== lastZoomRef.current;

    if (viewChanged) {
        const maxIterations = computeMaxIterations(
            view.zoom,
            params.iterationBase,
            params.iterationScale,
            params.iterationCap,
        );

        // Primary at the exact view centre; secondary a few pixels away (still useful for the
        // current view, but less likely to hit the same glitch).
        const primary = computeReferenceOrbit(centerRe, centerIm, maxIterations);
        const secondary = computeSecondaryOrbit(centerRe, centerIm, viewScale, maxIterations);

        textures.upload(primary, secondary);
        orbitsRef.current = { primary, secondary };

        lastCenterReRef.current = centerRe;
        lastCenterImRef.current = centerIm;
        lastZoomRef.current = view.zoom;
    }

    const orbits = orbitsRef.current;

    if (!orbits) {
        return {};
    }

    const [scaleHi, scaleLo] = splitDouble(viewScale);

    return {
        u_scale: [scaleHi, scaleLo],

        u_orbit: textures.tex1,
        u_orbitLength: orbits.primary.orbitLength,
        u_referenceIterations: orbits.primary.referenceIterations,

        u_orbit2: textures.tex2,
        u_orbitLength2: orbits.secondary.orbitLength,
        u_referenceIterations2: orbits.secondary.referenceIterations,

        ...fractalParamsUniforms(params),
    };
}

const SHADERS: Record<MandelbrotPrecision, string> = {
    naive: naiveShader,
    'double-split': doubleSplitShader,
    perturbation: perturbationShader,
};

type MandelbrotUniformProvider = (
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
    runtime: PerturbationRuntime,
) => Record<string, UniformValue>;

const UNIFORMS: Record<MandelbrotPrecision, MandelbrotUniformProvider> = {
    naive: naiveUniforms,
    'double-split': doubleSplitUniforms,
    perturbation: perturbationUniforms,
};

function Mandelbrot() {
    const params = useParams(mandelbrotStore);
    const precision = useMandelbrotPrecision();
    const surface = useMandelbrotSurface();

    const texturesRef = useRef<OrbitTextures | null>(null);
    const orbitsRef = useRef<Orbits | null>(null);
    const lastCenterReRef = useRef(NaN);
    const lastCenterImRef = useRef(NaN);
    const lastZoomRef = useRef(NaN);

    // Dispose the raw-GL orbit textures with the component and drop the glaze surface from the
    // store; the glaze runtime owns its own resources and cleans those up when the canvas unmounts.
    useEffect(() => {
        return () => {
            texturesRef.current?.dispose();
            texturesRef.current = null;
            orbitsRef.current = null;
            setMandelbrotSurface(null);
        };
    }, []);

    // Glaze reinitializes its programs on context restore, but our raw-GL orbit textures are
    // dead afterwards; recreate and re-upload the last orbits.
    useEffect(() => {
        const canvas = surface?.canvas;

        if (!canvas) {
            return;
        }

        const onRestored = () => {
            const orbits = orbitsRef.current;

            if (orbits) {
                texturesRef.current?.dispose();
                texturesRef.current?.upload(orbits.primary, orbits.secondary);
            }
        };

        canvas.addEventListener('webglcontextrestored', onRestored);

        return () => {
            canvas.removeEventListener('webglcontextrestored', onRestored);
        };
    }, [surface]);

    return (
        <GpuCanvas
            className="h-full w-full"
            fragmentShader={SHADERS[precision]}
            initialCamera={{ maxZoom: MAX_ZOOM }}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            onMount={setMandelbrotSurface}
            uniforms={({ camera: view, width, height, canvas }) =>
                UNIFORMS[precision](params, view, width, height, {
                    canvas,
                    texturesRef,
                    orbitsRef,
                    lastCenterReRef,
                    lastCenterImRef,
                    lastZoomRef,
                })
            }
        />
    );
}

export { Mandelbrot };

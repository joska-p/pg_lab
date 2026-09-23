import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import { useEffect, useRef, type RefObject } from 'react';

import { ZOOM_WHEEL_SPEED, WORLD_SCALE } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { createOrbitTextures, type OrbitTextures } from '../../core/orbitTextures';
import {
    computeReferenceOrbit,
    computeSecondaryOrbit,
    type ReferenceOrbit,
} from '../../core/referenceOrbit';
import { useDemandRender } from '../../lib/demandRender';
import { isPerfEnabled, perfLoopEnter, perfLoopExit, recordFractalFrame } from '../../lib/perf';
import { assemble } from '../../shaders/assemble';
import dsArithmeticChunk from '../../shaders/chunks/ds-arithmetic.glsl?raw';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import perturbationBody from './perturbation.glsl?raw';
import {
    cameraRig,
    setPerturbationSurface,
    useParams,
    usePerturbationSurface,
    type FractalParams,
} from './store';

const perturbationShader = assemble(dsArithmeticChunk, oklchChunk, lightingChunk, perturbationBody);

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

/** Per-frame CPU stats reported back to the PerfHUD via the out-param. */
export interface PerturbationStats {
    orbitMs: number;
    orbitLength: number;
    maxIterations: number;
}

function perturbationUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
    runtime: PerturbationRuntime,
    stats?: PerturbationStats,
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
        const tOrbit = isPerfEnabled() ? performance.now() : 0;
        const primary = computeReferenceOrbit(centerRe, centerIm, maxIterations);
        const secondary = computeSecondaryOrbit(centerRe, centerIm, viewScale, maxIterations);

        textures.upload(primary, secondary);
        orbitsRef.current = { primary, secondary };

        if (stats) {
            stats.orbitMs = isPerfEnabled() ? performance.now() - tOrbit : 0;
            stats.orbitLength = primary.orbitLength;
            stats.maxIterations = maxIterations;
        }

        lastCenterReRef.current = centerRe;
        lastCenterImRef.current = centerIm;
        lastZoomRef.current = view.zoom;
    } else if (stats && orbitsRef.current) {
        stats.orbitMs = 0;
        stats.orbitLength = orbitsRef.current.primary.orbitLength;
        stats.maxIterations = computeMaxIterations(
            view.zoom,
            params.iterationBase,
            params.iterationScale,
            params.iterationCap,
        );
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

function Perturbation() {
    const params = useParams();
    const surface = usePerturbationSurface();
    const demand = useDemandRender(params, cameraRig);

    const texturesRef = useRef<OrbitTextures | null>(null);
    const orbitsRef = useRef<Orbits | null>(null);
    const lastCenterReRef = useRef(NaN);
    const lastCenterImRef = useRef(NaN);
    const lastZoomRef = useRef(NaN);

    // Dispose the raw-GL orbit textures with the component and drop the glaze surface from the
    // store; the glaze runtime owns its own resources and cleans those up when the canvas unmounts.
    useEffect(() => {
        if (isPerfEnabled()) {
            perfLoopEnter();
        }
        return () => {
            texturesRef.current?.dispose();
            texturesRef.current = null;
            orbitsRef.current = null;
            setPerturbationSurface(null);
            if (isPerfEnabled()) {
                perfLoopExit();
            }
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
            fragmentShader={perturbationShader}
            camera={cameraRig.camera}
            cameraControls={cameraRig.controls}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            onMount={(s) => {
                setPerturbationSurface(s);
                demand.handleMount(s);
            }}
            shouldRender={demand.shouldRender}
            uniforms={({ camera: view, width, height, canvas }) => {
                cameraRig.setViewport(width, height);

                const perf = isPerfEnabled();
                const t0 = perf ? performance.now() : 0;
                const stats: PerturbationStats = { orbitMs: 0, orbitLength: 0, maxIterations: 0 };
                const result = perturbationUniforms(
                    params,
                    view,
                    width,
                    height,
                    {
                        canvas,
                        texturesRef,
                        orbitsRef,
                        lastCenterReRef,
                        lastCenterImRef,
                        lastZoomRef,
                    },
                    stats,
                );
                if (perf) {
                    recordFractalFrame(performance.now() - t0, width, height, {
                        orbitMs: stats.orbitMs,
                        orbitLength: stats.orbitLength,
                        maxIterations: stats.maxIterations,
                        zoom: view.zoom,
                    });
                }

                return result;
            }}
        />
    );
}

export { Perturbation };

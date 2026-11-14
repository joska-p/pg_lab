import type { Surface } from '@repo/surface/gpu/Surface';
import type { UniformValue } from '@repo/surface/gpu/types';
import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';
import { useCameraControls } from '@repo/surface/react/useCameraControls';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { WORLD_SCALE } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { createOrbitTextures } from '../../core/orbitTextures';
import type { OrbitTextures } from '../../core/orbitTextures';
import { computeReferenceOrbit, computeSecondaryOrbit } from '../../core/referenceOrbit';
import type { ReferenceOrbit } from '../../core/referenceOrbit';
import { useDemandRender } from '../../lib/demandRender';
import { isPerfEnabled, perfLoopEnter, perfLoopExit, recordFractalFrame } from '../../lib/perf';
import { assemble } from '../../shaders/assemble';
import dsArithmeticChunk from '../../shaders/chunks/ds-arithmetic.glsl?raw';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import perturbationBody from './perturbation.glsl?raw';
import { camera, useParams } from './store';
import type { FractalParams } from './store';

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

/** Per-frame component-owned refs the perturbation provider mutates. */
interface PerturbationRuntime {
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
    gl: WebGL2RenderingContext,
    runtime: PerturbationRuntime,
    stats?: PerturbationStats,
): Record<string, UniformValue> {
    const { texturesRef, orbitsRef, lastCenterReRef, lastCenterImRef, lastZoomRef } = runtime;

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

    // Lazily bind the orbit textures using the surface's WebGL context.
    let textures = texturesRef.current;

    if (!textures) {
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

function Perturbation() {
    const params = useParams();
    const demand = useDemandRender(params, camera);
    const cameraControls = useCameraControls(camera, {
        pan: { buttons: ['left', 'middle'] },
        zoom: { speed: 1.2 },
    });

    const texturesRef = useRef<OrbitTextures | null>(null);
    const orbitsRef = useRef<Orbits | null>(null);
    const lastCenterReRef = useRef(NaN);
    const lastCenterImRef = useRef(NaN);
    const lastZoomRef = useRef(NaN);

    const runtime: PerturbationRuntime = {
        texturesRef,
        orbitsRef,
        lastCenterReRef,
        lastCenterImRef,
        lastZoomRef,
    };

    // Dispose the raw-GL orbit textures with the component.
    useEffect(() => {
        if (isPerfEnabled()) {
            perfLoopEnter();
        }
        return () => {
            texturesRef.current?.dispose();
            texturesRef.current = null;
            orbitsRef.current = null;
            if (isPerfEnabled()) {
                perfLoopExit();
            }
        };
    }, []);

    return (
        <SurfaceCanvas
            {...cameraControls}
            className="h-full w-full"
            fragmentShader={perturbationShader}
            shouldRender={demand.shouldRender}
            onMount={demand.handleMount}
            onContextRestored={(surface: Surface) => {
                const orbits = orbitsRef.current;
                if (orbits) {
                    texturesRef.current?.dispose();
                    const textures = createOrbitTextures(surface.gl);
                    texturesRef.current = textures;
                    textures.upload(orbits.primary, orbits.secondary);
                }
            }}
            uniforms={(surface) => {
                camera.setViewport({ width: surface.width, height: surface.height });

                const perf = isPerfEnabled();
                const t0 = perf ? performance.now() : 0;
                const stats: PerturbationStats = { orbitMs: 0, orbitLength: 0, maxIterations: 0 };
                const result = perturbationUniforms(
                    params,
                    camera,
                    surface.width,
                    surface.height,
                    surface.gl,
                    runtime,
                    stats,
                );
                if (perf) {
                    recordFractalFrame(performance.now() - t0, surface.width, surface.height, {
                        orbitMs: stats.orbitMs,
                        orbitLength: stats.orbitLength,
                        maxIterations: stats.maxIterations,
                        zoom: camera.zoom,
                    });
                }

                return result;
            }}
        />
    );
}

export { Perturbation };

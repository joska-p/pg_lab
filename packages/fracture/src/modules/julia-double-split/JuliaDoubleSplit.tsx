import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import { useEffect } from 'react';

import { WORLD_SCALE, ZOOM_WHEEL_SPEED } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { useDemandRender } from '../../lib/demandRender';
import { isPerfEnabled, perfLoopEnter, perfLoopExit, recordFractalFrame } from '../../lib/perf';
import { assemble } from '../../shaders/assemble';
import dsArithmeticChunk from '../../shaders/chunks/ds-arithmetic.glsl?raw';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import juliaBody from './julia.glsl?raw';
import { cameraRig, useParams, type FractalParams } from './store';

const juliaDoubleSplitShader = assemble(dsArithmeticChunk, oklchChunk, lightingChunk, juliaBody);

interface CameraView {
    x: number;
    y: number;
    zoom: number;
}

function juliaDoubleSplitUniforms(
    params: FractalParams,
    camera: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    // Same complex-plane center mapping as the double-split Mandelbrot canvas:
    // c = (uvCoord − 0.5) · (3 / zoom) + center. For Julia the center is the
    // initial-z position, not the constant.
    const panNormX = camera.x / camera.zoom / width;
    const panNormY = camera.y / camera.zoom / height;
    const aspect = width / height;
    const drift = 1.0 - 1.0 / camera.zoom;
    const centerRe = -WORLD_SCALE * aspect * panNormX - 0.5 - 0.5 * WORLD_SCALE * aspect * drift;
    const centerIm = WORLD_SCALE * panNormY + 0.5 * WORLD_SCALE * drift;

    // Split each float64 center component into a double-single (hi, lo) pair of float32s (~48 bits)
    // before uploading, so the GPU keeps the center exact at zoom levels far beyond float32.
    const [centerReHi, centerReLo] = splitDouble(centerRe);
    const [centerImHi, centerImLo] = splitDouble(centerIm);

    return {
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
        u_juliaRe: params.juliaRe,
        u_juliaIm: params.juliaIm,
    };
}

export function JuliaDoubleSplit() {
    const params = useParams();
    const demand = useDemandRender(params, cameraRig);

    useEffect(() => {
        if (!isPerfEnabled()) {
            return;
        }
        perfLoopEnter();
        return () => {
            perfLoopExit();
        };
    }, []);

    return (
        <GpuCanvas
            className="h-full w-full"
            fragmentShader={juliaDoubleSplitShader}
            camera={cameraRig.camera}
            cameraControls={cameraRig.controls}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            shouldRender={demand.shouldRender}
            onMount={demand.handleMount}
            uniforms={({ camera, width, height }) => {
                cameraRig.setViewport(width, height);

                const t0 = isPerfEnabled() ? performance.now() : 0;
                const result = juliaDoubleSplitUniforms(params, camera, width, height);
                if (isPerfEnabled()) {
                    recordFractalFrame(performance.now() - t0, width, height, {
                        maxIterations: computeMaxIterations(
                            camera.zoom,
                            params.iterationBase,
                            params.iterationScale,
                            params.iterationCap,
                        ),
                        zoom: camera.zoom,
                    });
                }

                return result;
            }}
        />
    );
}

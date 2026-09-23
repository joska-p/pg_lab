import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import { useEffect } from 'react';

import { ZOOM_WHEEL_SPEED, WORLD_SCALE } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { useDemandRender } from '../../lib/demandRender';
import { isPerfEnabled, perfLoopEnter, perfLoopExit, recordFractalFrame } from '../../lib/perf';
import { assemble } from '../../shaders/assemble';
import dsArithmeticChunk from '../../shaders/chunks/ds-arithmetic.glsl?raw';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import doubleSplitBody from './double-split.glsl?raw';
import { cameraRig, useParams, type FractalParams } from './store';

const doubleSplitShader = assemble(dsArithmeticChunk, oklchChunk, lightingChunk, doubleSplitBody);

interface CameraView {
    x: number;
    y: number;
    zoom: number;
}

function doubleSplitUniforms(
    params: FractalParams,
    camera: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    // Map the interaction camera onto the complex-plane center the double-split shader expects.
    // With its convention  c = (uvCoord − 0.5) · (3 / zoom) + center, the center is
    // (−WORLD_SCALE·aspect·panNormX − 0.5 − 0.5·WORLD_SCALE·aspect·drift,
    //  WORLD_SCALE·panNormY + 0.5·WORLD_SCALE·drift); the drift terms pin the anchor to
    // screenToWorld across zoom.
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
    };
}

function DoubleSplit() {
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
            fragmentShader={doubleSplitShader}
            camera={cameraRig.camera}
            cameraControls={cameraRig.controls}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            shouldRender={demand.shouldRender}
            onMount={demand.handleMount}
            uniforms={({ camera, width, height }) => {
                cameraRig.setViewport(width, height);

                const t0 = isPerfEnabled() ? performance.now() : 0;
                const result = doubleSplitUniforms(params, camera, width, height);
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

export { DoubleSplit };

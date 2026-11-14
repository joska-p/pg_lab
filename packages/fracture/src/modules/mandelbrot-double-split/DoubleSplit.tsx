import type { UniformValue } from '@repo/surface/gpu/types';
import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';
import { useCameraControls } from '@repo/surface/react/useCameraControls';
import { useEffect } from 'react';

import { WORLD_SCALE } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { useDemandRender } from '../../lib/demandRender';
import { isPerfEnabled, perfLoopEnter, perfLoopExit, recordFractalFrame } from '../../lib/perf';
import { assemble } from '../../shaders/assemble';
import dsArithmeticChunk from '../../shaders/chunks/ds-arithmetic.glsl?raw';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import doubleSplitBody from './double-split.glsl?raw';
import { camera, useParams } from './store';
import type { FractalParams } from './store';

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
        u_camera: [camera.x, camera.y, camera.zoom],
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

function DoubleSplit() {
    const params = useParams();
    const demand = useDemandRender(params, camera);
    const cameraControls = useCameraControls(camera, {
        pan: { buttons: ['left', 'middle'] },
        zoom: { speed: 1.2 },
    });

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
        <SurfaceCanvas
            {...cameraControls}
            className="h-full w-full"
            fragmentShader={doubleSplitShader}
            shouldRender={demand.shouldRender}
            onMount={demand.handleMount}
            uniforms={(surface) => {
                camera.setViewport({ width: surface.width, height: surface.height });

                const t0 = isPerfEnabled() ? performance.now() : 0;
                const result = doubleSplitUniforms(params, camera, surface.width, surface.height);
                if (isPerfEnabled()) {
                    recordFractalFrame(performance.now() - t0, surface.width, surface.height, {
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

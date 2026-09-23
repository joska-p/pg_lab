import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import { useEffect } from 'react';

import { ZOOM_WHEEL_SPEED } from '../../core/camera';
import { computeMaxIterations } from '../../core/iterationPolicy';
import { useDemandRender } from '../../lib/demandRender';
import { isPerfEnabled, perfLoopEnter, perfLoopExit, recordFractalFrame } from '../../lib/perf';
import { assemble } from '../../shaders/assemble';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import naiveBody from './naive.glsl?raw';
import { cameraRig, useParams, type FractalParams } from './store';

const naiveShader = assemble(oklchChunk, lightingChunk, naiveBody);

interface CameraView {
    x: number;
    y: number;
    zoom: number;
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

export function Naive() {
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
            fragmentShader={naiveShader}
            camera={cameraRig.camera}
            cameraControls={cameraRig.controls}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            shouldRender={demand.shouldRender}
            onMount={demand.handleMount}
            uniforms={({ camera: view, width, height }) => {
                cameraRig.setViewport(width, height);

                const t0 = isPerfEnabled() ? performance.now() : 0;
                const result = naiveUniforms(params, view, width, height);
                if (isPerfEnabled()) {
                    recordFractalFrame(performance.now() - t0, width, height, {
                        maxIterations: computeMaxIterations(
                            view.zoom,
                            params.iterationBase,
                            params.iterationScale,
                            params.iterationCap,
                        ),
                        zoom: view.zoom,
                    });
                }

                return result;
            }}
        />
    );
}

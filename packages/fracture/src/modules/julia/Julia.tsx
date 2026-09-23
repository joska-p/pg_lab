import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import { ZOOM_WHEEL_SPEED } from '../../core/camera';
import { assemble } from '../../shaders/assemble';
import lightingChunk from '../../shaders/chunks/lighting.glsl?raw';
import oklchChunk from '../../shaders/chunks/oklch.glsl?raw';
import juliaBody from './julia.glsl?raw';
import { cameraRig, useParams, type FractalParams } from './store';

const juliaShader = assemble(oklchChunk, lightingChunk, juliaBody);

interface CameraView {
    x: number;
    y: number;
    zoom: number;
}

function juliaUniforms(
    params: FractalParams,
    view: CameraView,
    width: number,
    height: number,
): Record<string, UniformValue> {
    // Same UV-space pan mapping as the naive Mandelbrot canvas: the shader
    // applies u_panOffset after zoom, and a drag offset moves content opposite
    // the cursor, so x is negated. The −0.5·drift terms pin the anchor to
    // screenToWorld across zoom.
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
        u_juliaRe: params.juliaRe,
        u_juliaIm: params.juliaIm,
    };
}

export function Julia() {
    const params = useParams();

    return (
        <GpuCanvas
            className="h-full w-full"
            fragmentShader={juliaShader}
            camera={cameraRig.camera}
            cameraControls={cameraRig.controls}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            uniforms={({ camera: view, width, height }) => {
                cameraRig.setViewport(width, height);

                return juliaUniforms(params, view, width, height);
            }}
        />
    );
}

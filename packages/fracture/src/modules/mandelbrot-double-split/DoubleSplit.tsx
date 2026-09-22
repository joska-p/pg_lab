import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import { ZOOM_WHEEL_SPEED } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import doubleSplitShader from './double-split.glsl?raw';
import { useParams, type FractalParams } from './store';

/**
 * Double-single (~48 bit) camera ceiling: far beyond float32, conservatively under what naive f64
 * centers could reach (D10).
 */
const MAX_ZOOM = 1e11;

// Complex-plane width of the view at zoom = 1. The shaders map (uv − 0.5) · (3 / zoom) onto the
// complex plane, so the double-split centre uses this fixed width.
const WORLD_SCALE = 3.0;

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

    return (
        <GpuCanvas
            className="h-full w-full"
            fragmentShader={doubleSplitShader}
            initialCamera={{ maxZoom: MAX_ZOOM }}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            uniforms={({ camera, width, height }) =>
                doubleSplitUniforms(params, camera, width, height)
            }
        />
    );
}

export { DoubleSplit };

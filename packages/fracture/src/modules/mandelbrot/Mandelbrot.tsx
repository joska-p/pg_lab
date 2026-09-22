import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import { ZOOM_WHEEL_SPEED } from '../../core/camera';
import { splitDouble } from '../../core/doubleSplit';
import doubleSplitShader from '../../shaders/mandelbrot/double-split.glsl?raw';
import naiveShader from '../../shaders/mandelbrot/naive.glsl?raw';
import {
    mandelbrotStore,
    useMandelbrotPrecision,
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
    // (−3·aspect·panNormX − 0.5 − 1.5·aspect·drift, 3·panNormY + 1.5·drift); the drift terms pin
    // the anchor to screenToWorld across zoom.
    const panNormX = view.x / view.zoom / width;
    const panNormY = view.y / view.zoom / height;
    const aspect = width / height;
    const drift = 1.0 - 1.0 / view.zoom;
    const centerRe = -3.0 * aspect * panNormX - 0.5 - 1.5 * aspect * drift;
    const centerIm = 3.0 * panNormY + 1.5 * drift;

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

const SHADERS: Record<MandelbrotPrecision, string> = {
    naive: naiveShader,
    'double-split': doubleSplitShader,
};

const UNIFORMS: Record<
    MandelbrotPrecision,
    (
        params: FractalParams,
        view: CameraView,
        width: number,
        height: number,
    ) => Record<string, UniformValue>
> = {
    naive: naiveUniforms,
    'double-split': doubleSplitUniforms,
};

function Mandelbrot() {
    const params = useParams(mandelbrotStore);
    const precision = useMandelbrotPrecision();

    return (
        <GpuCanvas
            className="h-full w-full"
            fragmentShader={SHADERS[precision]}
            initialCamera={{ maxZoom: MAX_ZOOM }}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            uniforms={({ camera: view, width, height }) =>
                UNIFORMS[precision](params, view, width, height)
            }
        />
    );
}

export { Mandelbrot };

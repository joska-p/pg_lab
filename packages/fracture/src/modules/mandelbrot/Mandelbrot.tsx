import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import { ZOOM_WHEEL_SPEED } from '../../core/camera';
import naiveShader from '../../shaders/mandelbrot/naive.glsl?raw';
import { mandelbrotStore } from '../../stores/mandelbrotStore';
import { useParams } from '../../stores/paramStore';
import { fractalParamsUniforms } from './fractalUniforms';

/**
 * One shared camera per experiment across precision modes (D2): glaze clamps the zoom of every
 * precision to this single ceiling. Naive float32 degrades honestly far below it — that is the
 * comparison value the workshop exists for.
 */
const MAX_ZOOM = 1e15;

function Mandelbrot() {
    const params = useParams(mandelbrotStore);

    return (
        <GpuCanvas
            className="h-full w-full"
            fragmentShader={naiveShader}
            initialCamera={{ maxZoom: MAX_ZOOM }}
            canvasInteractions={{ zoom: { speed: ZOOM_WHEEL_SPEED } }}
            uniforms={({ camera: view, width, height }) => {
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
            }}
        />
    );
}

export { Mandelbrot };

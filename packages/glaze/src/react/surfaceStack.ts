import { createCamera, type Camera } from '../core/Camera';
import { createCameraControls } from '../core/CameraControls';
import type { CameraControls } from '../core/cameraTypes';
import { createZoomFactor } from '../core/cameraTypes';
import { resolveDevicePixelRatio } from '../core/environment';
import { InputRouter } from '../core/gestures';
import type { Gesture } from '../core/gestureTypes';
import { createCpuSurface } from '../cpu/CpuSurface';
import type { CpuSurface } from '../cpu/types';
import { createGpuSurface } from '../gpu/GpuSurface';
import type { GpuSurface } from '../gpu/types';
import { createClockStore } from './clockStore';
import type {
    CpuStack,
    GpuStack,
    InitialCamera,
    RoutableSurface,
    StackDisposable,
} from './stackTypes';
import type { CpuSurfaceOptions, GpuSurfaceOptions } from './types';

/** `T` with every possibly-undefined property narrowed to its defined form. */
type Compact<T> = {
    [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
};

/**
 * Drops keys whose value is `undefined` so optional config fields stay genuinely absent instead of
 * carrying an explicit `undefined` (`exactOptionalPropertyTypes`).
 */
function compact<T extends object>(source: T): Compact<T> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(source)) {
        if (value !== undefined) result[key] = value;
    }

    return result as Compact<T>;
}

/** Builds a camera from declared spawn state; origin at zoom 1 when a field is omitted. */
function createCameraFromInitial(initial: InitialCamera = {}): Camera {
    return createCamera(
        initial.pan?.x ?? 0,
        initial.pan?.y ?? 0,
        createZoomFactor(initial.zoom ?? 1),
    );
}

/**
 * Resolves the camera layer shared by every surface variant: an explicit instance wins over config,
 * otherwise one is built from `initialCamera`. The result is always complete — no `undefined` ever
 * escapes.
 */
function resolveCameraLayer(
    camera: Camera | undefined,
    cameraControls: CameraControls | undefined,
    initialCamera: InitialCamera = {},
): { camera: Camera; cameraControls: CameraControls } {
    const resolvedCamera = camera ?? createCameraFromInitial(initialCamera);
    const resolvedCameraControls =
        cameraControls ??
        createCameraControls(resolvedCamera, initialCamera.minZoom, initialCamera.maxZoom);

    return { camera: resolvedCamera, cameraControls: resolvedCameraControls };
}

/**
 * Wires the gesture layer to a freshly built surface. If subscription fails, the surface is
 * destroyed before the error propagates so WebGL contexts and DOM listeners never leak.
 */
function createInputRouter<TSurface extends RoutableSurface>(
    surface: TSurface,
    cameraControls: CameraControls,
    getGestures: () => Gesture<TSurface>[],
): InputRouter<TSurface> {
    try {
        return new InputRouter({
            input: surface.input,
            cameraControls,
            getSurface: () => surface,
            getGestures,
        });
    } catch (err) {
        surface.destroy();
        throw err;
    }
}

/** Assembles a `CpuStack` for a canvas node; `dispose` tears down everything it created. */
export function createCpuStack(
    canvas: HTMLCanvasElement,
    { camera, cameraControls, initialCamera, dpr, frameLoopOptions }: CpuSurfaceOptions,
    getGestures: () => Gesture<CpuSurface>[],
): CpuStack & StackDisposable {
    const { camera: resolvedCamera, cameraControls: resolvedCameraControls } = resolveCameraLayer(
        camera,
        cameraControls,
        initialCamera,
    );
    const resolvedDpr = resolveDevicePixelRatio(dpr);
    const surface = createCpuSurface(
        compact({ canvas, camera: resolvedCamera, dpr: resolvedDpr, frameLoopOptions }),
    );
    const inputRouter = createInputRouter(surface, resolvedCameraControls, getGestures);

    return {
        surface,
        cameraControls: resolvedCameraControls,
        inputRouter,
        dispose() {
            inputRouter?.dispose();
            surface.destroy();
        },
    };
}

/** Assembles a `GpuStack` for a canvas node; `dispose` tears down everything it created. */
export function createGpuStack(
    canvas: HTMLCanvasElement,
    {
        camera,
        cameraControls,
        initialCamera,
        dpr,
        clock,
        clockOptions,
        frameLoopOptions,
    }: GpuSurfaceOptions,
    getGestures: () => Gesture<GpuSurface>[],
): GpuStack & StackDisposable {
    const { camera: resolvedCamera, cameraControls: resolvedCameraControls } = resolveCameraLayer(
        camera,
        cameraControls,
        initialCamera,
    );
    const resolvedDpr = resolveDevicePixelRatio(dpr);
    const surface = createGpuSurface(
        compact({
            canvas,
            camera: resolvedCamera,
            dpr: resolvedDpr,
            clock,
            clockOptions,
            frameLoopOptions,
        }),
    );
    const inputRouter = createInputRouter(surface, resolvedCameraControls, getGestures);

    return {
        surface,
        cameraControls: resolvedCameraControls,
        inputRouter,
        clockStore: createClockStore(surface.clock),
        dispose() {
            inputRouter?.dispose();
            surface.destroy();
        },
    };
}

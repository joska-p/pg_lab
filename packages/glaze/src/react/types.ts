import type { CSSProperties } from 'react';

import type { PositiveNumber } from '../core/brands';
import type { Camera } from '../core/Camera';
import type { CameraControls } from '../core/cameraTypes';
import type { Clock } from '../core/Clock';
import type { FrameLoopOptions } from '../core/frameTypes';
import type { InteractionEvent, PanOptions, ZoomOptions } from '../core/gestureTypes';
import type { ClockMixin } from '../core/surfaceTypes';
import type { DurationSeconds, Seconds } from '../core/time';
import type { CpuDraw, CpuSurface } from '../cpu/types';
import type { Program } from '../gpu/shader/Program';
import type { ShaderError } from '../gpu/shader/ShaderError';
import type { UniformValue } from '../gpu/shader/types';
import type { GpuDraw, GpuSurface, UniformValues } from '../gpu/types';
import type { InitialCamera } from './stackTypes';

// ---------------------------------------------------------------------------
// Observable & Store types
// ---------------------------------------------------------------------------

export type Notify = () => void;
export type Unsubscribe = () => void;

export interface Observable {
    notify(): void;
    subscribe(fn: Notify): Unsubscribe;
}

export interface ClockStore {
    clock: Clock;
    readonly time: Seconds;
    readonly deltaTime: Seconds;
    readonly duration: DurationSeconds | undefined;
    readonly progress: number;
    togglePlay(): void;
    play(): void;
    pause(): void;
    reset(): void;
    setSpeed(speed: PositiveNumber): void;
    setDuration(duration: DurationSeconds): void;
    subscribe(fn: () => void): () => void;
    getSnapshot(): Seconds;
    getIsPlaying(): boolean;
}

// ---------------------------------------------------------------------------
// Interaction & Gesture adapters
// ---------------------------------------------------------------------------

/**
 * `InteractionEvent` with a non-null `surface` — the pipeline only routes events while a surface is
 * mounted.
 */
export interface LiveInteractionEvent<TEvent, TSurface> extends Omit<
    InteractionEvent<TEvent, TSurface>,
    'surface'
> {
    surface: TSurface;
}

/**
 * `onStart` / `onMove` / `onZoom` replace the built-in pan/zoom; `onEnd` / `onContextMenu` run
 * alongside, so drag state always gets released. `pan` / `zoom` configure the built-ins (`false`
 * disables).
 */
export interface CanvasInteractions<TSurface> {
    pan?: boolean | PanOptions;
    zoom?: boolean | ZoomOptions;
    onStart?: (event: LiveInteractionEvent<PointerEvent, TSurface>) => void;
    onMove?: (event: LiveInteractionEvent<PointerEvent, TSurface>) => void;
    onEnd?: (event: LiveInteractionEvent<PointerEvent, TSurface>) => void;
    onZoom?: (event: LiveInteractionEvent<WheelEvent, TSurface>) => void;
    onContextMenu?: (event: LiveInteractionEvent<MouseEvent, TSurface>) => void;
}

// ---------------------------------------------------------------------------
// Surface options (stack inputs + canvas props base)
// ---------------------------------------------------------------------------

/** `initialCamera` only applies when no `camera` instance is provided. */
export interface SurfaceOptionsBase {
    camera?: Camera;
    cameraControls?: CameraControls;
    initialCamera?: InitialCamera;
    dpr?: PositiveNumber;
    frameLoopOptions?: FrameLoopOptions;
}

/** `initialCamera` only applies when no `camera` instance is provided. */
export interface CpuSurfaceOptions extends SurfaceOptionsBase, ClockMixin {}

export interface GpuSurfaceOptions extends SurfaceOptionsBase, ClockMixin {
    contextOptions?: WebGLContextAttributes;
}

// ---------------------------------------------------------------------------
// Canvas Components Props
// ---------------------------------------------------------------------------

export interface CpuCanvasProps extends CpuSurfaceOptions {
    onFrame?: CpuDraw;
    /**
     * Called exactly once per `CpuSurface` instance, right after it's created — the right place for
     * one-time setup.
     *
     * This guarantee holds regardless of how often the `onMount` callback itself changes identity
     * across renders: it is keyed to the surface, not to React's effect dependencies.
     */
    onMount?: (surface: CpuSurface) => void;
    /** Called once per `CpuSurface` instance, alongside `onMount`. */
    onClockStore?: (clockStore: ClockStore) => void;
    canvasInteractions?: CanvasInteractions<CpuSurface>;
    className?: string;
    style?: CSSProperties;
}

export interface FrameRenderContext {
    readonly surface: GpuSurface;
    readonly program: Program;
    readonly uniforms: UniformValues;
}

export interface GpuCanvasProps extends GpuSurfaceOptions {
    /** Compiled on mount and recompiled whenever the source changes. */
    fragmentShader?: string;
    /** Vertex shader; must use `gl_VertexID` (draws 3 vertices, no attributes). */
    vertexShader?: string;
    /**
     * `ShaderError` when the driver refuses the new shader (the previous one stays live), `null`
     * after a success.
     */
    onShaderError?: (error: ShaderError | null) => void;
    /** Computed from the surface before each frame's draw. */
    uniforms?: (surface: GpuSurface) => Record<string, UniformValue>;
    /**
     * Replaces the default `surface.renderProgram(program, uniforms)` call. Runs only when the
     * render gate allows a draw.
     */
    renderFrame?: (context: FrameRenderContext) => void;
    /**
     * Opt-in render gate evaluated before each frame's draw. Return false to skip `setUniforms` +
     * `renderProgram` for this frame (GPU stays idle); `onFrame` still runs. Defaults to always
     * rendering (continuous mode). Lets static content (fractals, stills) sleep while mounted. A
     * program that has never been drawn is always drawn once, whatever this returns, so a freshly
     * swapped shader can never stay invisible behind the gate.
     */
    shouldRender?: (surface: GpuSurface) => boolean;
    onFrame?: GpuDraw;
    /**
     * Called exactly once per `GpuSurface` instance, right after it's created — the right place for
     * one-time setup (`createProgram`, `createStateBuffer`, seeding simulation state).
     *
     * This guarantee holds regardless of how often the `onMount` callback itself changes identity
     * across renders: it is keyed to the surface, not to React's effect dependencies.
     */
    onMount?: (surface: GpuSurface) => void;
    /** Called once per `GpuSurface` instance, alongside `onMount`. */
    onClockStore?: (clockStore: ClockStore) => void;
    /**
     * Called after `webglcontextlost` → `webglcontextrestored`, once the surface has recreated
     * every GPU resource it owns. Application data (simulation state, custom targets) must be
     * re-seeded here: `glaze` recreates resources empty.
     */
    onContextRestored?: (surface: GpuSurface) => void;
    canvasInteractions?: CanvasInteractions<GpuSurface>;
    className?: string;
    style?: CSSProperties;
}

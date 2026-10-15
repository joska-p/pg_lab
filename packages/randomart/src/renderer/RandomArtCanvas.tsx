import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import type { GpuSurface } from '@repo/glaze/gpu/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import { useRef, type CSSProperties } from 'react';

import {
    calculatePhase,
    DEFAULT_CONTEXT_OPTIONS,
    DEFAULT_LOOP_DURATION,
    HANDWRITTEN_TEST_SHADER,
} from './contract';
import { needsRender, type RenderKey } from './renderGate';

export interface RandomArtCanvasProps {
    /** Fragment shader source code adhering to randomart's GLSL contract. */
    fragmentShader?: string;
    /** True when the shader reads `u_phase` (CompiledShader.animated). Defaults to true. */
    animated?: boolean;
    /** Animation loop duration. Defaults to 8 seconds. */
    duration?: DurationSeconds;
    /** Callback invoked whenever shader compilation succeeds (null) or fails (ShaderError). */
    onShaderError?: (error: ShaderError | null) => void;
    /** Callback connecting the clock store to the UI store. */
    onClockStore?: (clockStore: ClockStore) => void;
    /** Called once on mount — use to capture surface.canvas for export. */
    onMount?: (surface: GpuSurface) => void;
    className?: string;
    style?: CSSProperties;
}

/**
 * Thin adapter around @repo/glaze GpuCanvas tailored for randomart. Configures timed clock looping
 * (paused at phase 0 until the user presses Play), WebGL context flags, and supplies `u_phase`.
 *
 * Rendering is lazy: a still image, a paused animation or a static shader costs no GPU time. This
 * relies on `preserveDrawingBuffer: true` (the picture survives between frames); the gate redraws
 * on phase changes, canvas resizes (which clear the buffer) and context restoration.
 */
export function RandomArtCanvas({
    fragmentShader = HANDWRITTEN_TEST_SHADER,
    animated = true,
    duration = DEFAULT_LOOP_DURATION,
    onShaderError,
    onClockStore,
    onMount,
    className,
    style,
}: RandomArtCanvasProps) {
    const lastRenderRef = useRef<RenderKey | null>(null);

    function handleMount(surface: GpuSurface): void {
        // A restored context comes back blank: forget what was drawn so the next frame redraws.
        surface.canvas.addEventListener('webglcontextrestored', () => {
            lastRenderRef.current = null;
        });
        onMount?.(surface);
    }

    return (
        <GpuCanvas
            fragmentShader={fragmentShader}
            clockOptions={{
                mode: 'timed',
                duration,
                loop: true,
                autoStart: false,
            }}
            contextOptions={DEFAULT_CONTEXT_OPTIONS}
            uniforms={(surface) => ({
                u_phase: calculatePhase(surface.clock.progress),
            })}
            shouldRender={(surface) => {
                const key: RenderKey = {
                    phase: calculatePhase(surface.clock.progress),
                    width: surface.width,
                    height: surface.height,
                    dpr: surface.dpr,
                    animated,
                };
                const render = needsRender(lastRenderRef.current, key);

                if (render) {
                    lastRenderRef.current = key;
                }

                return render;
            }}
            onShaderError={onShaderError}
            onClockStore={onClockStore}
            onMount={handleMount}
            canvasInteractions={{ pan: false, zoom: false }}
            className={className}
            style={style}
        />
    );
}

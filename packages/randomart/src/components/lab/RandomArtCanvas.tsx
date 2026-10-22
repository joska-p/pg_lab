import { createCanvasDimension } from '@repo/glaze/core/render';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import type { GpuSurface } from '@repo/glaze/gpu/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import { useRef } from 'react';
import type { CSSProperties } from 'react';

import { DEFAULT_LOOP_DURATION } from '../../core/config/derived';
import { createPhase, DEFAULT_CONTEXT_OPTIONS } from '../../core/renderer/contract/contract';
import { needsRender } from '../../core/renderer/renderGate/renderGate';
import type { RenderKey } from '../../core/renderer/renderGate/renderGate';
import { HANDWRITTEN_TEST_SHADER } from '../test/shaders';

interface RandomArtCanvasProps {
    /** Fragment shader source code adhering to randomart's GLSL contract. */
    fragmentShader?: string;
    /** True when the shader reads `u_phase` (CompiledShader.animated). Defaults to true. */
    animated?: boolean;
    /** Animation loop duration. Defaults to `DEFAULT_LOOP_DURATION`. */
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
 * Thin adapter around @repo/glaze GpuCanvas for randomart. Timed clock (paused at phase 0), WebGL
 * context flags, supplies `u_phase`. Lazy rendering: still/paused/static costs no GPU time. Relies
 * on `preserveDrawingBuffer: true`; gate redraws on phase change, resize, context restore.
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
                u_phase: createPhase(surface.clock.progress),
            })}
            shouldRender={(surface) => {
                const key: RenderKey = {
                    phase: createPhase(surface.clock.progress),
                    // Safe in-frame: glaze's resize() runs before subscribers, clamps CSS size >= 1.
                    // Never build in eager paths (onMount, effects): surface dims are 0 before first frame.
                    width: createCanvasDimension(surface.width),
                    height: createCanvasDimension(surface.height),
                    // DPR carried from glaze, not de-branded.
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

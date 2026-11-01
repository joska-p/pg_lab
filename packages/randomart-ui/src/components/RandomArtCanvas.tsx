import { createCanvasDimension } from '@repo/glaze/core/render';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import type { GpuSurface } from '@repo/glaze/gpu/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import { useRef } from 'react';
import type { CSSProperties } from 'react';

import { createPhase, needsRender } from '../renderer/renderGate';
import type { RenderKey } from '../renderer/renderGate';
import { DEFAULT_LOOP_DURATION } from '../stores/vmStore';

const DEFAULT_CONTEXT_OPTIONS: WebGLContextAttributes = {
    antialias: false,
    preserveDrawingBuffer: true,
};

interface RandomArtCanvasProps {
    fragmentShader: string;
    animated?: boolean;
    duration?: DurationSeconds;
    onShaderError?: (error: ShaderError | null) => void;
    onClockStore?: (clockStore: ClockStore) => void;
    onMount?: (surface: GpuSurface) => void;
    className?: string;
    style?: CSSProperties;
}

export function RandomArtCanvas({
    fragmentShader,
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
                    width: createCanvasDimension(surface.width),
                    height: createCanvasDimension(surface.height),
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

import { useEffect, useRef } from 'react';

import type { Program } from '../gpu/shader/Program';
import type { GpuSurface } from '../gpu/types';
import { createInteractionAdapter } from './interactions';
import { swapProgram } from './programSwap';
import { createGpuStack } from './surfaceStack';
import type { GpuCanvasProps } from './types';
import { useNodeResource } from './useNodeResource';

export function GpuCanvas({
    fragmentShader,
    vertexShader,
    onShaderError,
    uniforms,
    shouldRender,
    onFrame,
    onMount,
    onClockStore,
    canvasInteractions,
    className,
    style,
    ...surfaceOptions
}: GpuCanvasProps) {
    const gestures = createInteractionAdapter(canvasInteractions);
    const gesturesRef = useRef(gestures);

    const { ref: canvasRef, resource: stack } = useNodeResource((canvas: HTMLCanvasElement) =>
        createGpuStack(canvas, surfaceOptions, () => gesturesRef.current),
    );
    const programRef = useRef<Program | null>(null);

    // Latest-callback pattern: a new `onShaderError` identity must not trigger a recompilation.
    const onShaderErrorRef = useRef(onShaderError);

    useEffect(() => {
        onShaderErrorRef.current = onShaderError;
    });

    // ── Program Lifecycle Effect ──
    // Declared before the compilation effect: when the surface changes, the old program is dropped
    // first. It must NOT run when only the shader changes — that is what keeps the last good one.
    useEffect(() => {
        if (!stack) {
            return;
        }

        return () => {
            programRef.current?.destroy();
            programRef.current = null;
        };
    }, [stack]);

    // ── Shader Compilation Effect ──
    // A refused shader is a normal outcome: the live program stays, `onShaderError` reports it.
    useEffect(() => {
        if (!stack || !fragmentShader) {
            return;
        }

        const error = swapProgram(
            programRef,
            stack.surface.tryCreateProgram(fragmentShader, vertexShader),
        );

        onShaderErrorRef.current?.(error);
    }, [fragmentShader, vertexShader, stack]);

    // ── Mount Effect ──
    const mountedSurfaceRef = useRef<GpuSurface | null>(null);

    useEffect(() => {
        if (!stack || mountedSurfaceRef.current === stack.surface) {
            return;
        }

        mountedSurfaceRef.current = stack.surface;
        onMount?.(stack.surface);
        onClockStore?.(stack.clockStore);
    }, [onClockStore, onMount, stack]);

    // ── Frame Loop Effect ──
    useEffect(() => {
        if (!stack) {
            return;
        }

        if (onFrame === undefined && fragmentShader === undefined) {
            return;
        }

        return stack.surface.onFrame((frame) => {
            const program = programRef.current;

            if (program && (!shouldRender || shouldRender(frame))) {
                program.setUniforms(uniforms ? uniforms(frame) : {});
                frame.renderProgram(program);
            }

            onFrame?.(frame);
        });
    }, [onFrame, uniforms, shouldRender, fragmentShader, stack]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                touchAction: 'none',
                ...style,
            }}
        />
    );
}

import React, { useEffect, useRef } from 'react';

import type { Program } from '../gpu/Program';
import type { ShaderError } from '../gpu/ShaderError';
import { Surface } from '../gpu/Surface';
import type { UniformValue } from '../gpu/types';
import { useLatest } from './useLatest';
import { useNodeResource } from './useNodeResource';
import { globalPlaybackStore } from './usePlayback';

export type { UniformValue, ShaderError, Surface };

export interface SurfaceCanvasProps extends Omit<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    'style' | 'className'
> {
    /**
     * Fragment shader source — Shadertoy syntax: `void mainImage(out vec4 fragColor, in vec2
     * fragCoord)`
     *
     * Legacy `void main()` shaders are also accepted.
     */
    fragmentShader: string;
    /**
     * Additional uniforms (on top of the auto-injected `iResolution`, `iTime`, etc.). Called each
     * frame; return a fresh object.
     */
    uniforms?: (surface: Surface) => Record<string, UniformValue>;
    /**
     * Called when the shader fails to compile or link (`ShaderError`), or `undefined` after a
     * successful recompilation.
     */
    onShaderError?: (error: ShaderError | undefined) => void;
    /** Called once, right after the Surface is created — the right place for one-time setup. */
    onMount?: (surface: Surface) => void;
    /** Called each frame. */
    onFrame?: (surface: Surface) => void;
    /** Called when the WebGL context is restored. */
    onContextRestored?: (surface: Surface) => void;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * SurfaceCanvas — a fullscreen WebGL2 canvas driven by a Shadertoy-compatible fragment shader.
 *
 * Auto-injects: `iResolution`, `iTime`, `iTimeDelta`, `iFrame`, `iMouse`. Syncs play/pause with the
 * global `usePlayback()` store.
 */
export function SurfaceCanvas({
    fragmentShader,
    uniforms,
    onShaderError,
    onMount,
    onFrame,
    onContextRestored,
    className,
    style,
    ...canvasProps
}: SurfaceCanvasProps): React.ReactElement {
    // Create a Surface when the canvas node mounts; destroy it when it unmounts.
    const { ref, resource: surface } = useNodeResource(
        (canvas: HTMLCanvasElement) => new Surface(canvas),
    );

    // Stable references to callbacks (identity may change each render)
    const uniformsRef = useLatest(uniforms);
    const onShaderErrorRef = useLatest(onShaderError);
    const onMountRef = useLatest(onMount);
    const onFrameRef = useLatest(onFrame);
    const onContextRestoredRef = useLatest(onContextRestored);

    // Current compiled program — managed imperatively, not through effect cleanup.
    // Kept as ref so the frame loop always reads the latest version.
    const programRef = useRef<Program | null>(null);

    // -------------------------------------------------------------------------
    // onMount callback — fires once per Surface instance
    useEffect(() => {
        if (!surface) {
            return;
        }
        onMountRef.current?.(surface);
    }, [surface, onMountRef]);

    // -------------------------------------------------------------------------
    // onContextRestored callback
    useEffect(() => {
        if (!surface) {
            return;
        }

        return surface.onContextRestored((s) => {
            onContextRestoredRef.current?.(s);
        });
    }, [surface, onContextRestoredRef]);

    // -------------------------------------------------------------------------
    // Compile shader whenever fragmentShader source or surface changes.
    // Strategy: on success → replace the program; on failure → keep the previous one (fallback).
    // The previous surface's program is destroyed when the surface itself is destroyed (Surface.destroy).
    useEffect(() => {
        if (!surface) {
            return;
        }

        const result = surface.tryCreateProgram(fragmentShader);

        if (result.ok) {
            // Destroy previous program and install the new one.
            programRef.current?.destroy();
            programRef.current = result.program;
            onShaderErrorRef.current?.(undefined);
        } else {
            // Keep the previous program alive as a fallback; report the error.
            if (onShaderErrorRef.current) {
                onShaderErrorRef.current(result.error);
            } else {
                console.error('SurfaceCanvas shader compilation error:', result.error);
            }
        }
    }, [surface, fragmentShader, onShaderErrorRef]);

    // -------------------------------------------------------------------------
    // Sync global play/pause store → surface clock
    useEffect(() => {
        if (!surface) {
            return;
        }

        // Apply current state immediately
        if (globalPlaybackStore.isPlaying) {
            surface.clock.play();
        } else {
            surface.clock.pause();
        }

        // Subscribe to future changes
        return globalPlaybackStore.subscribe(() => {
            if (globalPlaybackStore.isPlaying) {
                surface.clock.play();
            } else {
                surface.clock.pause();
            }
        });
    }, [surface]);

    // -------------------------------------------------------------------------
    // Animation frame loop — renders every frame
    useEffect(() => {
        if (!surface) {
            return;
        }

        return surface.onFrame((s) => {
            onFrameRef.current?.(s);

            const program = programRef.current;

            if (!program) {
                return;
            }

            const extraUniforms = uniformsRef.current?.(s);
            s.renderProgram(program, extraUniforms);
        });
    }, [surface, uniformsRef, onFrameRef]);

    return (
        <canvas
            ref={ref}
            className={className}
            style={{
                display: 'block',
                width: '100%',
                height: '100%',
                touchAction: 'none',
                ...style,
            }}
            {...canvasProps}
        />
    );
}

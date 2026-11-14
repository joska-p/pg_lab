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
     * Additional uniforms (on top of the auto-injected `iResolution`, `iTime`, etc.). Called only
     * on frames that are actually drawn; return a fresh object.
     */
    uniforms?: (surface: Surface) => Record<string, UniformValue>;
    /**
     * Called when the shader fails to compile or link (`ShaderError`), or `undefined` after a
     * successful recompilation.
     */
    onShaderError?: (error: ShaderError | undefined) => void;
    /**
     * Render gate. When absent, every frame is drawn. When `false`, `uniforms` is not called and
     * nothing is drawn — but `onFrame` still runs.
     *
     * A program that has never been drawn is always drawn once, regardless of this gate. The same
     * one-shot redraw happens after a successful shader swap and after a WebGL context restore.
     */
    shouldRender?: (surface: Surface) => boolean;
    /** Called once, right after the Surface is created — the right place for one-time setup. */
    onMount?: (surface: Surface) => void;
    /**
     * Called each frame, before the draw and before `uniforms` — even when `shouldRender` skips the
     * draw. Per-frame order: `onFrame` → `uniforms` → `renderProgram`.
     */
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
    shouldRender,
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
    const shouldRenderRef = useLatest(shouldRender);
    const onShaderErrorRef = useLatest(onShaderError);
    const onMountRef = useLatest(onMount);
    const onFrameRef = useLatest(onFrame);
    const onContextRestoredRef = useLatest(onContextRestored);

    // Current compiled program — managed imperatively, not through effect cleanup.
    // Kept as ref so the frame loop always reads the latest version.
    const programRef = useRef<Program | null>(null);

    // Last program actually drawn. A never-drawn program (fresh shader swap) always gets one
    // redraw even when `shouldRender` says no; otherwise the previous image would stay on screen.
    const renderedProgramRef = useRef<Program | null>(null);

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
            // The framebuffer is gone; force one redraw even if the gate says no.
            renderedProgramRef.current = null;
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
    // Animation frame loop
    useEffect(() => {
        if (!surface) {
            return;
        }

        return surface.onFrame((s) => {
            // `onFrame` runs first, every frame, whether or not a draw happens below.
            onFrameRef.current?.(s);

            const program = programRef.current;

            if (!program) {
                return;
            }

            const gate = shouldRenderRef.current;
            const wanted = gate ? gate(s) : true;

            // A program that was never drawn (new shader, restored context) gets exactly one draw.
            if (!wanted && program === renderedProgramRef.current) {
                return;
            }

            const extraUniforms = uniformsRef.current?.(s);
            s.renderProgram(program, extraUniforms);
            renderedProgramRef.current = program;
        });
    }, [surface, uniformsRef, shouldRenderRef, onFrameRef]);

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

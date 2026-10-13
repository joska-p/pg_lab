import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import type { CSSProperties } from 'react';

import {
    calculatePhase,
    DEFAULT_CONTEXT_OPTIONS,
    DEFAULT_LOOP_DURATION,
    HANDWRITTEN_TEST_SHADER,
} from './contract';

export interface RandomArtCanvasProps {
    /** Fragment shader source code adhering to randomart's GLSL contract. */
    fragmentShader?: string;
    /** Animation loop duration. Defaults to 8 seconds. */
    duration?: DurationSeconds;
    /** Callback invoked whenever shader compilation succeeds (null) or fails (ShaderError). */
    onShaderError?: (error: ShaderError | null) => void;
    /** Callback connecting the clock store to the UI store. */
    onClockStore?: (clockStore: ClockStore) => void;
    className?: string;
    style?: CSSProperties;
}

/**
 * Thin adapter around @repo/glaze GpuCanvas tailored for randomart. Configures timed clock looping,
 * WebGL context flags, and supplies `u_phase`.
 */
export function RandomArtCanvas({
    fragmentShader = HANDWRITTEN_TEST_SHADER,
    duration = DEFAULT_LOOP_DURATION,
    onShaderError,
    onClockStore,
    className,
    style,
}: RandomArtCanvasProps) {
    return (
        <GpuCanvas
            fragmentShader={fragmentShader}
            clockOptions={{
                mode: 'timed',
                duration,
                loop: true,
            }}
            contextOptions={DEFAULT_CONTEXT_OPTIONS}
            uniforms={(surface) => ({
                u_phase: calculatePhase(surface.clock.progress),
            })}
            onShaderError={onShaderError}
            onClockStore={onClockStore}
            canvasInteractions={{ pan: false, zoom: false }}
            className={className}
            style={style}
        />
    );
}

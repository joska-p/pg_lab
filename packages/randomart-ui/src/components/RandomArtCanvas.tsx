import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import * as stylex from '@stylexjs/stylex';
import { useRef } from 'react';

import { DEFAULT_LOOP_DURATION } from '../constants';
import { createPhase, needsRender } from '../renderer/renderGate';
import type { RenderKey } from '../renderer/renderGate';

const DEFAULT_CONTEXT_OPTIONS: WebGLContextAttributes = {
    antialias: false,
};

interface RandomArtCanvasProps {
    /** Fragment shader source code adhering to randomart's GLSL contract. */
    fragmentShader: string;
    /** True when the shader reads `u_phase` (CompiledShader.animated). Defaults to true. */
    animated?: boolean;
    /** Animation loop duration. Defaults to `DEFAULT_LOOP_DURATION`. */
    duration?: DurationSeconds;
    /** Callback invoked whenever shader compilation succeeds (null) or fails (ShaderError). */
    onShaderError?: (error: ShaderError | null) => void;
    /** Callback connecting the clock store to the UI store. */
    onClockStore?: (clockStore: ClockStore) => void;
}

const styles = stylex.create({
    parentContainer: {
        containerType: 'size',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    canva: {
        aspectRatio: '1 / 1',
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        '@container (orientation: landscape)': {
            width: 'auto',
            height: '100%',
        },
    },
});

/**
 * Thin adapter around @repo/glaze GpuCanvas for randomart. Timed clock (paused at phase 0), WebGL
 * context flags, supplies `u_phase`. Lazy rendering: still/paused/static costs no GPU time. The
 * drawing buffer is not preserved; export re-renders offscreen.
 *
 * A newly installed program is always drawn once by GpuCanvas, independently of `shouldRender`, so
 * changing the shader appears even while the clock is paused.
 *
 * `shouldRender` records the key it approves before the draw happens. The only way a draw is
 * skipped after approval is a lost WebGL context (`GpuSurface.renderProgram` returns early), and
 * `onContextRestored` resets `lastRenderRef` so the next frame redraws. Keep that reset in place if
 * this gate changes.
 */
export function RandomArtCanvas({
    fragmentShader,
    animated = true,
    duration = DEFAULT_LOOP_DURATION,
    onShaderError,
    onClockStore,
}: RandomArtCanvasProps) {
    const lastRenderRef = useRef<RenderKey | null>(null);

    return (
        <div {...stylex.props(styles.parentContainer)}>
            <div {...stylex.props(styles.canva)}>
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
                    onContextRestored={() => {
                        lastRenderRef.current = null;
                    }}
                    canvasInteractions={{ pan: false, zoom: false }}
                />
            </div>
        </div>
    );
}

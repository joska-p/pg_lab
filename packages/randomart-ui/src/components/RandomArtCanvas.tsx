import type { DurationSeconds } from '@repo/glaze/core/time';
import type { RenderTargetPair } from '@repo/glaze/gpu/RenderTargetPair';
import type { Program } from '@repo/glaze/gpu/shader/Program';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import type { GpuSurface } from '@repo/glaze/gpu/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import { DEFAULT_LOOP_DURATION } from '../constants';
import { POST_PROCESS_EFFECTS } from '../postProcessing/effects';
import type { PostProcessEffectId } from '../postProcessing/effects';
import { createPhase, needsRender } from '../renderer/renderGate';
import type { RenderKey } from '../renderer/renderGate';
import { getActiveEffectsKey } from '../stores/postProcessingStore';

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
    /** Active post-processing effects. */
    activeEffects?: Readonly<Record<PostProcessEffectId, boolean>>;
    /** Callback invoked whenever shader compilation succeeds (null) or fails (ShaderError). */
    onShaderError?: (error: ShaderError | null) => void;
    /** Callback connecting the clock store to the UI store. */
    onClockStore?: (clockStore: ClockStore) => void;
}

interface PipelineResources {
    surface: GpuSurface;
    pair: RenderTargetPair;
    programs: Map<string, Program>;
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
    activeEffects,
    onShaderError,
    onClockStore,
}: RandomArtCanvasProps) {
    const lastRenderRef = useRef<RenderKey | null>(null);
    const pipelineRef = useRef<PipelineResources | null>(null);

    useEffect(() => {
        return () => {
            pipelineRef.current = null;
        };
    }, []);

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
                        const postProcess = activeEffects ? getActiveEffectsKey(activeEffects) : '';
                        const key: RenderKey = {
                            phase: createPhase(surface.clock.progress),
                            width: surface.width,
                            height: surface.height,
                            dpr: surface.dpr,
                            animated,
                            postProcess,
                        };
                        const render = needsRender(lastRenderRef.current, key);

                        if (render) {
                            lastRenderRef.current = key;
                        }

                        return render;
                    }}
                    renderFrame={({ surface, program, uniforms }) => {
                        const activeList = POST_PROCESS_EFFECTS.filter(
                            (effect) => activeEffects?.[effect.id] === true,
                        ).sort((a, b) => a.order - b.order);

                        const finalEffect = activeList[activeList.length - 1];
                        if (!finalEffect) {
                            surface.renderProgram(program, uniforms);
                            return;
                        }

                        let pipeline = pipelineRef.current;
                        if (!pipeline || pipeline.surface !== surface) {
                            pipeline = {
                                surface,
                                pair: surface.createRenderTargetPair(
                                    surface.deviceWidth,
                                    surface.deviceHeight,
                                    { filter: 'linear' },
                                ),
                                programs: new Map(),
                            };
                            pipelineRef.current = pipeline;
                        } else if (
                            pipeline.pair.width !== surface.deviceWidth ||
                            pipeline.pair.height !== surface.deviceHeight
                        ) {
                            pipeline.pair.resize(surface.deviceWidth, surface.deviceHeight);
                        }

                        const { pair, programs } = pipeline;

                        // Pass 1: Render the base shader into offscreen target pair.write
                        surface.renderProgramTo(program, pair.write, uniforms);
                        pair.swap();

                        // Intermediate passes (if any)
                        for (let i = 0; i < activeList.length - 1; i++) {
                            const effect = activeList[i];
                            if (!effect) {
                                continue;
                            }
                            let effectProgram = programs.get(effect.id);
                            if (!effectProgram) {
                                effectProgram = surface.createProgram(effect.fragmentShader);
                                programs.set(effect.id, effectProgram);
                            }

                            surface.renderProgramTo(effectProgram, pair.write, {
                                u_source: pair.read.texture,
                            });
                            pair.swap();
                        }

                        // Final pass: Draw into the default framebuffer (canvas)
                        let finalProgram = programs.get(finalEffect.id);
                        if (!finalProgram) {
                            finalProgram = surface.createProgram(finalEffect.fragmentShader);
                            programs.set(finalEffect.id, finalProgram);
                        }

                        surface.renderProgram(finalProgram, {
                            u_source: pair.read.texture,
                        });
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

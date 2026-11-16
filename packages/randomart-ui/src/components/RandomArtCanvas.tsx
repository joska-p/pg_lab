import type { TargetPair } from '@repo/surface/gpu/TargetPair';
import type { Program, ShaderError, GpuSurface } from '@repo/surface/react/GpuCanvas';
import { GpuCanvas } from '@repo/surface/react/GpuCanvas';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import { POST_PROCESS_EFFECTS } from '../postProcessing/effects';
import type { PostProcessEffectId } from '../postProcessing/effects';
import { needsRender } from '../renderer/renderGate';
import type { RenderKey } from '../renderer/renderGate';
import { getActiveEffectsKey } from '../stores/postProcessingStore';
import type { SurfaceClock } from '../stores/surfaceStore';

interface RandomArtCanvasProps {
    /** Fragment shader source code (Shadertoy image shader) from randomart-core. */
    fragmentShader: string;
    /** True when the shader is animated (uses iTime/ra_phase). Defaults to true. */
    animated?: boolean;
    /** Active post-processing effects. */
    activeEffects?: Readonly<Partial<Record<PostProcessEffectId, boolean>>>;
    /**
     * Callback invoked whenever shader compilation succeeds (null/undefined) or fails
     * (ShaderError).
     */
    onShaderError?: (error: ShaderError | null | undefined) => void;
    /** Callback connecting the surface clock to the UI store. */
    onClockStore?: (clockStore: SurfaceClock) => void;
}

interface PipelineResources {
    surface: GpuSurface;
    pair: TargetPair;
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
 * Thin adapter around @repo/surface GpuCanvas for randomart. `iTime` is the surface clock time;
 * `ra_phase()` scales it inside the shader. Lazy rendering: still/paused/static costs no GPU time.
 * The drawing buffer is not preserved; export re-renders offscreen.
 *
 * A newly installed program is always drawn once by GpuCanvas, independently of `shouldRender`, so
 * changing the shader appears even while the clock is paused.
 *
 * `shouldRender` records the key it approves before the draw happens. The only way a draw is
 * skipped after approval is a lost WebGL context, and `onContextRestored` resets `lastRenderRef` so
 * the next frame redraws. Keep that reset in place if this gate changes.
 */
export function RandomArtCanvas({
    fragmentShader,
    animated = true,
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
                    shouldRender={(surface) => {
                        const postProcess = activeEffects ? getActiveEffectsKey(activeEffects) : '';
                        const key: RenderKey = {
                            time: surface.clock.time,
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
                        if (surface.deviceWidth <= 0 || surface.deviceHeight <= 0) {
                            return;
                        }

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
                                pair: surface.createTargetPair(
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
                        surface.renderTo(pair.write, program, uniforms);
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

                            surface.renderTo(pair.write, effectProgram, {
                                u_source: pair.read.texture,
                                u_resolution: [surface.deviceWidth, surface.deviceHeight],
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
                            u_resolution: [surface.deviceWidth, surface.deviceHeight],
                        });
                    }}
                    onShaderError={onShaderError}
                    onMount={(surface) => {
                        onClockStore?.({
                            get time() {
                                return surface.clock.time;
                            },
                            play: () => surface.clock.play(),
                            pause: () => surface.clock.pause(),
                            reset: () => surface.clock.reset(),
                        });
                    }}
                    onContextRestored={() => {
                        lastRenderRef.current = null;
                    }}
                />
            </div>
        </div>
    );
}

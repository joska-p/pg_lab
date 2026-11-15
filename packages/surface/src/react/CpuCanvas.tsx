import React, { useEffect } from 'react';

import { CpuSurface } from '../cpu/CpuSurface';
import { useLatest } from './useLatest';
import { useNodeResource } from './useNodeResource';

export type { CpuSurface };

export interface CpuCanvasProps extends Omit<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    'style' | 'className'
> {
    /** Called once, right after the CpuSurface is created — the right place for one-time setup. */
    onMount?: (surface: CpuSurface) => void;
    /**
     * Called each frame. The canvas is sized and the context scaled by `dpr` before this runs; the
     * frame loop only starts when this prop is provided.
     */
    onFrame?: (surface: CpuSurface) => void;
    /** Pixel ratio override. When omitted, `window.devicePixelRatio` is read each frame. */
    dpr?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * CpuCanvas — a Canvas2D canvas driven by a CpuSurface.
 *
 * The runtime owns sizing, DPR, the frame loop, and the clock. Drawing state, clearing, layout, and
 * styles stay in the application.
 */
export function CpuCanvas({
    onMount,
    onFrame,
    dpr,
    className,
    style,
    ...canvasProps
}: CpuCanvasProps): React.ReactElement {
    // Create a CpuSurface when the canvas node mounts; destroy it when it unmounts.
    const { ref, resource: surface } = useNodeResource(
        (canvas: HTMLCanvasElement) => new CpuSurface(canvas, { dpr }),
    );

    // Stable references to callbacks (identity may change each render)
    const onMountRef = useLatest(onMount);
    const onFrameRef = useLatest(onFrame);

    // -------------------------------------------------------------------------
    // onMount callback — fires once per CpuSurface instance
    useEffect(() => {
        if (!surface) {
            return;
        }
        onMountRef.current?.(surface);
    }, [surface, onMountRef]);

    // -------------------------------------------------------------------------
    // Animation frame loop — only runs when a frame callback is actually provided
    const needsFrameLoop = onFrame !== undefined;

    useEffect(() => {
        if (!surface || !needsFrameLoop) {
            return;
        }

        return surface.onFrame((s) => {
            onFrameRef.current?.(s);
        });
    }, [surface, needsFrameLoop, onFrameRef]);

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

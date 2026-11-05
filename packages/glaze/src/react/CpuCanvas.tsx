import { useEffect } from 'react';

import { createInteractionAdapter } from './interactions';
import { createCpuStack } from './surfaceStack';
import type { CpuCanvasProps } from './types';
import { useLatest } from './useLatest';
import { useNodeResource } from './useNodeResource';

export function CpuCanvas({
    onFrame,
    onMount,
    onClockStore,
    canvasInteractions,
    className,
    style,
    ...surfaceOptions
}: CpuCanvasProps) {
    const gesturesRef = useLatest(createInteractionAdapter(canvasInteractions));
    const onMountRef = useLatest(onMount);
    const onClockStoreRef = useLatest(onClockStore);
    const onFrameRef = useLatest(onFrame);

    const { ref: canvasRef, resource: stack } = useNodeResource((canvas: HTMLCanvasElement) =>
        createCpuStack(canvas, surfaceOptions, () => gesturesRef.current),
    );

    useEffect(() => {
        if (!stack) {
            return;
        }

        onMountRef.current?.(stack.surface);
        onClockStoreRef.current?.(stack.clockStore);
    }, [onMountRef, onClockStoreRef, stack]);

    // ── Frame Loop Effect ──
    const needsFrameLoop = onFrame !== undefined;

    useEffect(() => {
        if (!stack || !needsFrameLoop) {
            return;
        }

        return stack.surface.onFrame((frame) => {
            onFrameRef.current?.(frame);
        });
    }, [onFrameRef, stack, needsFrameLoop]);

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

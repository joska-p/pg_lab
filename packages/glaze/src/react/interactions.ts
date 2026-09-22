import { PanGesture, ZoomGesture } from '../core/gestures';
import type { Gesture, InteractionEvent } from '../core/gestureTypes';
import type { CanvasInteractions, LiveInteractionEvent } from './types';

function withSurface<TEvent, TSurface>(
    event: InteractionEvent<TEvent, TSurface>,
    run: (event: LiveInteractionEvent<TEvent, TSurface>) => void,
): void {
    if (event.surface) {
        run({ ...event, surface: event.surface });
    }
}

/**
 * Pure factory: no Hooks, no React. Freshness of `interactions`'s callbacks is the caller's concern
 * — in this codebase, `CpuCanvas.tsx` / `GpuCanvas.tsx` already read gestures through a ref-backed
 * getter (`() => gesturesRef.current`) passed to `createCpuStack`/`createGpuStack`, so whatever
 * closures are captured here are always read fresh at call time. No extra stabilization
 * (useEffectEvent, ref-wrapped callbacks, etc.) is needed at this layer — adding one here would be
 * redundant with the getter indirection already in place upstream.
 */
export function createInteractionAdapter<TSurface>(
    interactions: CanvasInteractions<TSurface> = {},
): Gesture<TSurface>[] {
    const gestures: Gesture<TSurface>[] = [];

    const lifecycle: Gesture<TSurface> = {};

    if (interactions.onStart) {
        lifecycle.onStart = (event: InteractionEvent<PointerEvent, TSurface>) => {
            withSurface(event, (e) => {
                interactions.onStart?.(e);
            });
        };
    }

    if (interactions.onMove) {
        lifecycle.onMove = (event: InteractionEvent<PointerEvent, TSurface>) => {
            withSurface(event, (e) => {
                interactions.onMove?.(e);
            });
        };
    }

    if (interactions.onZoom) {
        lifecycle.onZoom = (event: InteractionEvent<WheelEvent, TSurface>) => {
            withSurface(event, (e) => {
                interactions.onZoom?.(e);
            });
        };
    }

    if (interactions.onEnd) {
        lifecycle.onEnd = (event: InteractionEvent<PointerEvent, TSurface>) => {
            withSurface(event, (e) => {
                interactions.onEnd?.(e);
            });
        };
    }

    if (interactions.onContextMenu) {
        lifecycle.onContextMenu = (event: InteractionEvent<MouseEvent, TSurface>) => {
            withSurface(event, (e) => {
                interactions.onContextMenu?.(e);
            });
        };
    }

    if (
        lifecycle.onStart ||
        lifecycle.onMove ||
        lifecycle.onEnd ||
        lifecycle.onZoom ||
        lifecycle.onContextMenu
    ) {
        gestures.push(lifecycle);
    }

    if (!interactions.onStart && !interactions.onMove && interactions.pan !== false) {
        gestures.push(new PanGesture(typeof interactions.pan === 'object' ? interactions.pan : {}));
    }

    if (!interactions.onZoom && interactions.zoom !== false) {
        gestures.push(
            new ZoomGesture(typeof interactions.zoom === 'object' ? interactions.zoom : {}),
        );
    }

    return gestures;
}

import type { FitMode, PlacedRect, Size } from './types';

export function computeFit(source: Size, viewport: Size, mode: FitMode = 'contain'): PlacedRect {
    const scale =
        mode === 'contain'
            ? Math.min(viewport.width / source.width, viewport.height / source.height)
            : Math.max(viewport.width / source.width, viewport.height / source.height);

    const w = source.width * scale;
    const h = source.height * scale;

    return {
        x: (viewport.width - w) / 2,
        y: (viewport.height - h) / 2,
        w,
        h,
    };
}

export function toPixelAligned(rect: PlacedRect): PlacedRect {
    const x = Math.round(rect.x);
    const y = Math.round(rect.y);

    return {
        x,
        y,
        w: Math.round(rect.x + rect.w) - x,
        h: Math.round(rect.y + rect.h) - y,
    };
}

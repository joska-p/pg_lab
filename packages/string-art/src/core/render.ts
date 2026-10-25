import type { CpuSurface } from '@repo/glaze/cpu/CpuSurface';

import type { PlacedRect } from './types';

type BlittableImage = ImageBitmap | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;

/** ImageData n'est pas dessinable par drawImage → on l'embarque dans un canvas invisible. */
export function toBlittableImage(data: ImageData): BlittableImage {
    const canvas = new OffscreenCanvas(data.width, data.height);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('OffscreenCanvas 2D context unavailable');
    }

    context.putImageData(data, 0, 0);

    return canvas;
}

/** Copie l'image aux coordonnées écran (ignore la caméra), en CSS pixels. */
export function blit(
    surface: CpuSurface,
    source: BlittableImage,
    placement: PlacedRect,
    smoothing = true,
): void {
    const context = surface.canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas 2D context unavailable');
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0); // annule la caméra appliquée par applyCamera()
    context.scale(surface.dpr, surface.dpr);
    context.imageSmoothingEnabled = smoothing;
    context.drawImage(source, placement.x, placement.y, placement.w, placement.h);
    context.restore();
}

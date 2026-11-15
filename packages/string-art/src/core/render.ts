import type { CpuSurface } from '@repo/surface/cpu/CpuSurface';

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

/** Copie l'image aux coordonnées écran en CSS pixels. */
export function blit(
    surface: CpuSurface,
    source: BlittableImage,
    placement: PlacedRect,
    smoothing = true,
): void {
    const { ctx } = surface;

    ctx.save();
    ctx.imageSmoothingEnabled = smoothing;
    ctx.drawImage(source, placement.x, placement.y, placement.w, placement.h);
    ctx.restore();
}

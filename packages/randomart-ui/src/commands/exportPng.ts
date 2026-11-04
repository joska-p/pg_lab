import type { Seed } from '@repo/randomart-core/seed';

/** Target device pixel ratio for high-resolution export. */
const EXPORT_DPR = 2;

/** Maximum dimension (width or height) for the export to avoid excessive memory. */
const MAX_EXPORT_DIMENSION = 4096;

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/** Seed text is arbitrary, so keep it filename-safe while preserving a readable identity. */
function filenameSeed(seed: Seed): string {
    return seed.replaceAll(/[^a-z0-9_-]+/gi, '-').replaceAll(/^-+|-+$/g, '') || 'seed';
}

/**
 * Export the current canvas as a high-resolution PNG using an offscreen canvas. This avoids
 * requiring `preserveDrawingBuffer: true` on the main canvas (which hurts performance). Failures
 * are thrown so the caller can report them.
 */
export async function exportPng(canvas: HTMLCanvasElement, seed: Seed): Promise<void> {
    const dpr = Math.min(EXPORT_DPR, window.devicePixelRatio || 1);
    const exportWidth = Math.min(Math.round(canvas.width * dpr), MAX_EXPORT_DIMENSION);
    const exportHeight = Math.min(Math.round(canvas.height * dpr), MAX_EXPORT_DIMENSION);

    const offscreen = new OffscreenCanvas(exportWidth, exportHeight);
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        throw new Error('PNG export failed: could not create offscreen canvas context');
    }

    ctx.drawImage(canvas, 0, 0, exportWidth, exportHeight);

    const blob = await offscreen.convertToBlob({ type: 'image/png' });
    if (!blob) {
        throw new Error('PNG export failed: offscreen canvas produced no data');
    }

    downloadBlob(blob, `randomart-${filenameSeed(seed)}.png`);
}

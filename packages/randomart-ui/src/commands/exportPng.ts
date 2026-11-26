import type { Seed } from '@repo/randomart-core/seed';

import { renderToBlob } from '../renderer/renderOffscreen';

/** Side of the exported square image, in pixels (capped by the GPU's viewport limits). */
const EXPORT_SIZE = 2048;

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
export function filenameSeed(seed: Seed): string {
    return seed.replaceAll(/[^a-z0-9_-]+/gi, '-').replaceAll(/^-+|-+$/g, '') || 'seed';
}

export interface ExportPngOptions {
    readonly fragmentShader: string;
    /** Value of `iTime` in seconds; irrelevant for a static shader. */
    readonly time: number;
    readonly seed: Seed;
}

/** Render the artwork offscreen at `EXPORT_SIZE` and download it. Failures are thrown. */
export async function exportPng({ fragmentShader, time, seed }: ExportPngOptions): Promise<void> {
    const blob = await renderToBlob({ fragmentShader, time, size: EXPORT_SIZE });
    downloadBlob(blob, `randomart-${filenameSeed(seed)}.png`);
}

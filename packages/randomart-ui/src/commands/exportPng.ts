import type { Seed } from '@repo/randomart-core/seed';

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

/** Export the current canvas as a PNG; failures are thrown so the caller can report them. */
export async function exportPng(canvas: HTMLCanvasElement, seed: Seed): Promise<void> {
    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), 'image/png');
    });

    if (blob === null) {
        throw new Error('PNG export failed: the canvas produced no data');
    }

    downloadBlob(blob, `randomart-${filenameSeed(seed)}.png`);
}

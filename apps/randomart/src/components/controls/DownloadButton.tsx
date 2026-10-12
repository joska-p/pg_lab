import type { GpuSurface } from '@repo/glaze/gpu/GpuSurface';
import { Button } from '@repo/ui/components/Button';
import { useState } from 'react';

import { useGpuSurface, useSeedText } from '../../stores/randomart/selectors';

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.download = filename;
    link.href = url;
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob && blob.size > 0) {
                resolve(blob);
            } else {
                reject(new Error('Failed to encode PNG'));
            }
        }, 'image/png');
    });
}

/**
 * Reads the live framebuffer inside the very next frame, after the surface has drawn it. The
 * default framebuffer is cleared once composited, so without `preserveDrawingBuffer` only an
 * in-frame readback is valid — an out-of-frame `toBlob` would be blank.
 */
function captureSurface(surface: GpuSurface): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const unsubscribe = surface.onFrame((live) => {
            unsubscribe();

            try {
                const canvas = live.canvas;
                const gl = canvas.getContext('webgl2');

                if (!gl) {
                    throw new Error('WebGL2 context unavailable');
                }

                const width = canvas.width;
                const height = canvas.height;
                const pixels = new Uint8Array(width * height * 4);

                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                // WebGL rows start at the bottom; image data starts at the top.
                const rowBytes = width * 4;
                const flipped = new Uint8ClampedArray(pixels.length);

                for (let row = 0; row < height; row++) {
                    const from = row * rowBytes;

                    flipped.set(
                        pixels.subarray(from, from + rowBytes),
                        (height - 1 - row) * rowBytes,
                    );
                }

                const output = document.createElement('canvas');

                output.width = width;
                output.height = height;
                const ctx = output.getContext('2d');

                if (!ctx) {
                    throw new Error('Could not get 2d context');
                }

                ctx.putImageData(new ImageData(flipped, width, height), 0, 0);
                resolve(toPngBlob(output));
            } catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
    });
}

function DownloadButton() {
    const gpuSurface = useGpuSurface();
    const seedText = useSeedText();
    const [downloading, setDownloading] = useState(false);

    const filename = `randomart-${(seedText || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;

    async function handleDownload() {
        if (!gpuSurface) {
            return;
        }

        setDownloading(true);

        try {
            triggerDownload(await captureSurface(gpuSurface), filename);
        } catch (error) {
            console.error('randomart: PNG export failed:', error);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <Button
            color="aurora"
            disabled={downloading || !gpuSurface}
            onClick={() => {
                void handleDownload();
            }}
        >
            {downloading ? '...' : 'png'}
        </Button>
    );
}

export { DownloadButton };

/// <reference lib="webworker" />

import { scaleTo255 } from '../../core/color';
import { getColorSpace } from '../../core/colorSpaces';
import type { RenderColorSpaceTask } from './types';

function renderColorSpace({ spaceId, zValue, size }: RenderColorSpaceTask): ImageBitmap {
    const { xAxis, yAxis, getColor } = getColorSpace(spaceId);
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('OffscreenCanvas 2D context unavailable');
    }

    const imageData = context.createImageData(size, size);
    const data = imageData.data;

    for (let pixelY = 0; pixelY < size; pixelY++) {
        for (let pixelX = 0; pixelX < size; pixelX++) {
            // Each pixel is a point on the (x, y) plane of the color space; the slider supplies z.
            const x = xAxis.min + (pixelX / size) * (xAxis.max - xAxis.min);
            const y = yAxis.max - (pixelY / size) * (yAxis.max - yAxis.min);

            const color = getColor(x, y, zValue);
            const [red, green, blue] = color.srgb;
            const index = (pixelY * size + pixelX) * 4;

            data[index] = scaleTo255(red);
            data[index + 1] = scaleTo255(green);
            data[index + 2] = scaleTo255(blue);
            data[index + 3] = 255;
        }
    }

    context.putImageData(imageData, 0, 0);

    return canvas.transferToImageBitmap();
}

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<RenderColorSpaceTask>) => {
    try {
        const bitmap = renderColorSpace(event.data);

        self.postMessage({ ok: true, bitmap }, [bitmap]);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown worker error';

        self.postMessage({ ok: false, error: message });
    }
};

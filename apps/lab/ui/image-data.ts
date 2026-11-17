/*
 * Image helpers shared by the two pixel experiments. They live in ui/ because
 * they need a scratch canvas; the image-processing engine in lib/ stays free of DOM.
 */

const SAMPLE_SIZE = 200;

export function createSampleImageData(size = SAMPLE_SIZE): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas 2D context unavailable');
    }

    const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
    );

    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.2, '#feca57');
    gradient.addColorStop(0.4, '#48dbfb');
    gradient.addColorStop(0.6, '#54a0ff');
    gradient.addColorStop(0.8, '#5f27cd');
    gradient.addColorStop(1, '#222222');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    return context.getImageData(0, 0, size, size);
}

export function imageDataToUrl(data: ImageData): string | null {
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;

    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    context.putImageData(data, 0, 0);

    return canvas.toDataURL('image/png');
}

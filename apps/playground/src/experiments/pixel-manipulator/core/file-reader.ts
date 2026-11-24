async function readFileAsImageData(file: File): Promise<ImageData> {
    if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
    }

    const bitmap = await createImageBitmap(file);

    try {
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas 2D context unavailable');
        }

        ctx.drawImage(bitmap, 0, 0);

        return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    } finally {
        bitmap.close();
    }
}

export { readFileAsImageData };

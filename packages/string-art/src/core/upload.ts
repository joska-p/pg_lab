export async function fileToImageData(file: File): Promise<ImageData> {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('OffscreenCanvas 2D context unavailable');
    }

    context.drawImage(bitmap, 0, 0);

    const data = context.getImageData(0, 0, bitmap.width, bitmap.height);

    bitmap.close();

    return data;
}

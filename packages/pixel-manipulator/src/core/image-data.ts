function putImageData(canvas: HTMLCanvasElement, imageData: ImageData): void {
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    ctx.putImageData(imageData, 0, 0);
}

function imageElementToImageData(image: HTMLImageElement): ImageData {
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get offscreen canvas context');
    }

    ctx.drawImage(image, 0, 0);

    return ctx.getImageData(0, 0, image.width, image.height);
}

export { imageElementToImageData, putImageData };

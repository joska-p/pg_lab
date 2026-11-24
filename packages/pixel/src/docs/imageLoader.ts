import geantUrl from '../assets/geant.jpg';

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            resolve(image);
        };
        image.onerror = reject;
        image.src = url;
    });
}

function generateTestImage(size: number): ImageData | null {
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.2, '#feca57');
    gradient.addColorStop(0.4, '#48dbfb');
    gradient.addColorStop(0.6, '#54a0ff');
    gradient.addColorStop(0.8, '#5f27cd');
    gradient.addColorStop(1, '#222');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    return context.getImageData(0, 0, size, size);
}

async function loadDemoImage(size: number): Promise<ImageData | null> {
    try {
        const image = await loadImage(geantUrl);
        const canvas = document.createElement('canvas');

        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('No context');
        }

        context.drawImage(image, 0, 0, size, size);

        return context.getImageData(0, 0, size, size);
    } catch {
        return generateTestImage(size);
    }
}

function imageDataToUrl(imageData: ImageData): string | null {
    const canvas = document.createElement('canvas');

    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
}

export { imageDataToUrl, loadDemoImage };

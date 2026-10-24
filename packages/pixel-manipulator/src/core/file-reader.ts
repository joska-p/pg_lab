import { imageElementToImageData } from './image-data';

function readFileAsImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));

            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                try {
                    resolve(imageElementToImageData(image));
                } catch (err) {
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            };
            image.onerror = () => {
                reject(new Error('Failed to load image from source'));
            };
            image.src = reader.result as string;
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}

export { readFileAsImageData };

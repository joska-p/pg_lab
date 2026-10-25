export type PixelTransform = (input: ImageData) => ImageData;

export function processImage(input: ImageData, transforms: readonly PixelTransform[]): ImageData {
    return transforms.reduce((accumulator, transform) => transform(accumulator), input);
}

interface SerializedImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export function isSerializedImageDataArray(data: unknown): data is SerializedImageData[] {
    return (
        Array.isArray(data) &&
        data.every((item: unknown) => {
            if (typeof item !== 'object' || item === null) {
                return false;
            }

            const obj = item as Record<string, unknown>;

            return (
                'data' in obj &&
                'width' in obj &&
                'height' in obj &&
                obj['data'] instanceof Uint8ClampedArray &&
                typeof obj['width'] === 'number' &&
                typeof obj['height'] === 'number'
            );
        })
    );
}

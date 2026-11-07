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

            return (
                'data' in item &&
                'width' in item &&
                'height' in item &&
                item.data instanceof Uint8ClampedArray &&
                typeof item.width === 'number' &&
                typeof item.height === 'number'
            );
        })
    );
}

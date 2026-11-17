export function clamp(v: number): number {
    return Math.max(0, Math.min(255, v));
}

export function getPixel(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number,
    channel: number,
): number {
    const cx = Math.max(0, Math.min(width - 1, x));
    const cy = Math.max(0, Math.min(height - 1, y));

    return data[(cy * width + cx) * 4 + channel] ?? 0;
}

export function applyKernel(
    source: Uint8ClampedArray,
    destination: Uint8ClampedArray,
    width: number,
    height: number,
    kernel: number[],
    kernelSize: number,
    divisor: number,
): void {
    const half = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let red = 0;
            let green = 0;
            let blue = 0;

            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const weight = kernel[ky * kernelSize + kx] ?? 0;

                    red +=
                        getPixel(source, x + kx - half, y + ky - half, width, height, 0) * weight;
                    green +=
                        getPixel(source, x + kx - half, y + ky - half, width, height, 1) * weight;
                    blue +=
                        getPixel(source, x + kx - half, y + ky - half, width, height, 2) * weight;
                }
            }

            const alpha = getPixel(source, x, y, width, height, 3);
            const i = (y * width + x) * 4;

            destination[i] = clamp(red / divisor);
            destination[i + 1] = clamp(green / divisor);
            destination[i + 2] = clamp(blue / divisor);
            destination[i + 3] = alpha;
        }
    }
}

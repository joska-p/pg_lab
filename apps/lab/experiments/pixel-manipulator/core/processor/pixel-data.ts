export class PixelData {
    readonly data: Uint8ClampedArray;
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number, data?: Uint8ClampedArray) {
        this.width = width;
        this.height = height;
        this.data = data ?? new Uint8ClampedArray(width * height * 4);
    }
}

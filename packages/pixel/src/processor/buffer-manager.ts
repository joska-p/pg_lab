import { PixelData } from './pixel-data';

export class BufferManager {
    private buffers: [Uint8ClampedArray, Uint8ClampedArray];
    private pointer: 0 | 1 = 0;
    private imageWidth: number;
    private imageHeight: number;

    constructor(source: PixelData) {
        this.buffers = [
            new Uint8ClampedArray(source.data),
            new Uint8ClampedArray(source.data.length),
        ];
        this.imageWidth = source.width;
        this.imageHeight = source.height;
    }

    get current() {
        return this.buffers[this.pointer];
    }

    get other() {
        return this.buffers[1 - this.pointer];
    }

    get width() {
        return this.imageWidth;
    }

    get height() {
        return this.imageHeight;
    }

    swap() {
        this.pointer = this.pointer === 0 ? 1 : 0;
    }

    snapshot() {
        const pixelData = new PixelData(this.imageWidth, this.imageHeight);

        pixelData.data.set(this.current);

        return pixelData;
    }

    replaceWith(pixelData: PixelData) {
        this.buffers[this.pointer] = new Uint8ClampedArray(pixelData.data);
        this.buffers[1 - this.pointer] = new Uint8ClampedArray(
            pixelData.width * pixelData.height * 4,
        );
        this.imageWidth = pixelData.width;
        this.imageHeight = pixelData.height;
    }
}

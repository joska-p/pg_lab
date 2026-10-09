// Minimal PNG encoder: this package only writes true-color images, so it implements just that
// subset of the spec and uses Node's built-in zlib instead of a third-party dependency.

import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';

const CRC_TABLE: number[] = (() => {
    const table: number[] = [];

    for (let n = 0; n < 256; n++) {
        let c = n;

        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }

        table[n] = c >>> 0;
    }

    return table;
})();

function crc32(buf: Buffer): number {
    let crc = 0xffffffff;

    for (const byte of buf.values()) {
        const idx = (crc ^ byte) & 0xff;

        crc = CRC_TABLE[idx] ^ (crc >>> 8);
    }

    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);

    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);

    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

export function encodePNG(rgb: Uint8Array, width: number, height: number): Buffer {
    const expected = width * height * 3;

    if (rgb.length !== expected) {
        throw new Error(`Pixel buffer size ${rgb.length} does not match expected ${expected}.`);
    }

    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const ihdr = Buffer.alloc(13);

    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8); // bit depth
    ihdr.writeUInt8(2, 9); // color type 2 = truecolor RGB
    ihdr.writeUInt8(0, 10); // compression
    ihdr.writeUInt8(0, 11); // filter
    ihdr.writeUInt8(0, 12); // interlace

    // PNG requires one filter byte (0 = none) before every scanline
    const stride = width * 3;
    const raw = Buffer.alloc((stride + 1) * height);

    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0;
        const srcStart = y * stride;

        rgb.subarray(srcStart, srcStart + stride).forEach((v, i) => {
            raw[y * (stride + 1) + 1 + i] = v;
        });
    }

    const idat = deflateSync(raw);

    return Buffer.concat([
        signature,
        chunk('IHDR', ihdr),
        chunk('IDAT', idat),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

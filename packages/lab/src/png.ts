import { deflateSync } from 'node:zlib';

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
    let c = n;

    for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb8_8320 ^ (c >>> 1) : c >>> 1;
    }

    return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
    let c = 0xffff_ffff;

    for (const byte of bytes) {
        c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
    }

    return (c ^ 0xffff_ffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const out = Buffer.alloc(body.length + 8);

    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);

    return out;
}

/** Minimal 8-bit RGB PNG encoder (no filtering): enough for contact sheets. */
export function encodePng(rgb: Uint8Array, width: number, height: number): Buffer {
    const header = Buffer.alloc(13);

    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8; // bit depth
    header[9] = 2; // colour type: RGB

    const stride = width * 3;
    const raw = Buffer.alloc((stride + 1) * height); // each row starts with filter byte 0

    for (let y = 0; y < height; y++) {
        Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride).copy(
            raw,
            y * (stride + 1) + 1,
        );
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', new Uint8Array(0)),
    ]);
}

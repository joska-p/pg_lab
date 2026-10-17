import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

import { describe, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import type { Expression, Node } from '../expression/index.ts';
import { formatFormula } from '../expression/index.ts';
import { generate } from '../generator/index.ts';
import { createGrammar, defaultGrammar } from '../grammar/index.ts';
import type { Grammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';

const enabled = import.meta.env.VITE_MEASURE === '1';
const SIZE = 256;
const OUT = '/tmp/opencode/field';

const fold2 = (v: number): number => Math.abs(((((v + 3) % 4) + 4) % 4) - 2) - 1;

interface P {
    x: number;
    y: number;
}

const evalNode = (node: Node, p: P, phase: number): number => {
    const a = (i: number): number => evalNode(node.inputs[i], p, phase);

    switch (node.operatorName) {
        case 'x':
            return p.x;
        case 'y':
            return p.y;
        case 'const':
            return node.params[0];
        case 'tsin':
            return Math.sin(2 * Math.PI * phase);
        case 'tcos':
            return Math.cos(2 * Math.PI * phase);
        case 'neg':
            return -a(0);
        case 'abs':
            return Math.abs(a(0));
        case 'sqr': {
            const v = a(0);
            return v * v;
        }
        case 'add':
            return (a(0) + a(1)) * 0.5;
        case 'mul':
            return a(0) * a(1);
        case 'div':
            return a(0) / (1 + Math.abs(a(1)));
        case 'min':
            return Math.min(a(0), a(1));
        case 'max':
            return Math.max(a(0), a(1));
        case 'mix': {
            const t = (a(2) + 1) * 0.5;
            return a(0) * (1 - t) + a(1) * t;
        }
        case 'gt':
            return a(0) > a(1) ? 1 : -1;
        case 'select':
            return a(0) > 0 ? a(1) : a(2);
        case 'sin':
            return Math.sin(Math.PI * a(0));
        case 'cos':
            return Math.cos(Math.PI * a(0));
        case 'warp': {
            const dx = a(0);
            const dy = a(1);
            const warped: P = { x: fold2(p.x + 0.5 * dx), y: fold2(p.y + 0.5 * dy) };
            return evalNode(node.inputs[2], warped, phase);
        }
        default:
            throw new Error(`render: no evaluator for "${node.operatorName}"`);
    }
};

// --- Contact-sheet colormaps ------------------------------------------------
// Deliberately local: the core no longer ships palettes (channels are a colour space + a shared
// trunk depth now). A contact sheet still needs *some* map from the raw field to RGB, so the probe
// keeps its own.
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

function cosine(a: number[], b: number[], c: number[], d: number[]) {
    return (t: number): number[] =>
        [0, 1, 2].map((i) => clamp01(a[i] + b[i] * Math.cos(2 * Math.PI * (c[i] * t + d[i]))));
}

const PALETTES: Record<string, (t: number) => number[]> = {
    spectrum: cosine([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1, 1, 1], [0, 0.33, 0.67]),
    mono: (t) => [t, t, t],
};

// --- Minimal PNG encoder ----------------------------------------------------
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
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
    let c = 0xffffffff;
    for (const byte of buf) {
        c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
}

function encodePng(width: number, height: number, rgb: Uint8Array): Buffer {
    const raw = Buffer.alloc((width * 3 + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (width * 3 + 1)] = 0; // filter: none
        rgb.subarray(y * width * 3, (y + 1) * width * 3).forEach((v, i) => {
            raw[y * (width * 3 + 1) + 1 + i] = v;
        });
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // colour type: truecolour
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

/** Renders the field through a palette. `map` turns the raw field into t in [0, 1]. */
function render(
    expression: Expression,
    palette: (t: number) => number[],
    map: (f: number) => number,
    size: number = SIZE,
): Uint8Array {
    const rgb = new Uint8Array(size * size * 3);
    for (let iy = 0; iy < size; iy++) {
        for (let ix = 0; ix < size; ix++) {
            const p: P = { x: (ix / (size - 1)) * 2 - 1, y: (iy / (size - 1)) * 2 - 1 };
            const [r, g, b] = palette(clamp01(map(evalNode(expression.r, p, 0))));
            const i = (iy * size + ix) * 3;
            rgb[i] = Math.round(r * 255);
            rgb[i + 1] = Math.round(g * 255);
            rgb[i + 2] = Math.round(b * 255);
        }
    }
    return rgb;
}

const MAPS = {
    hard: (f: number): number => f * 0.5 + 0.5,
    tanh: (f: number): number => 0.5 + 0.5 * Math.tanh(f),
    tanh2: (f: number): number => 0.5 + 0.5 * Math.tanh(2 * f),
};

describe('field render', () => {
    const withWeights = (overrides: Record<string, number>): Grammar => {
        const catalog = createDefaultCatalog();
        const weights: Record<string, number> = {};
        for (const op of catalog.operators()) {
            weights[op.name] =
                op.name === 'x' || op.name === 'y'
                    ? 3
                    : op.name === 'const'
                      ? 1
                      : op.name === 'select' || op.name === 'mix' || op.name === 'warp'
                        ? 0.5
                        : 1;
        }
        Object.assign(weights, overrides);
        const base = defaultGrammar(catalog);
        return createGrammar(catalog, {
            weights,
            constraints: base.constraints,
            channels: base.channels,
        });
    };

    const GENTLE = {
        x: 4,
        y: 4,
        max: 2,
        min: 1.5,
        const: 0.5,
        add: 0.5,
        gt: 0.5,
        tsin: 0.5,
        tcos: 0.5,
        mul: 0.75,
    };
    const STRONG = {
        x: 5,
        y: 5,
        max: 2,
        min: 2,
        const: 0.3,
        add: 0.3,
        gt: 0.3,
        tsin: 0.25,
        tcos: 0.25,
        mul: 0.5,
        select: 0.3,
        mix: 0.3,
    };

    function sheet(grammar: Grammar, path: string): void {
        const catalog = createDefaultCatalog();
        const COLS = 4;
        const ROWS = 3;
        const CELL = 160;
        const GAP = 4;
        const W = COLS * CELL + (COLS - 1) * GAP;
        const H = ROWS * CELL + (ROWS - 1) * GAP;
        const out = new Uint8Array(W * H * 3);

        for (let s = 0; s < COLS * ROWS; s++) {
            const expression = generate(catalog, grammar, createSeed(s * 7919 + 1));
            const cell = render(expression, PALETTES.spectrum, MAPS.hard, CELL);
            const ox = (s % COLS) * (CELL + GAP);
            const oy = Math.floor(s / COLS) * (CELL + GAP);
            for (let y = 0; y < CELL; y++) {
                for (let x = 0; x < CELL; x++) {
                    const src = (y * CELL + x) * 3;
                    const dst = ((oy + y) * W + ox + x) * 3;
                    out[dst] = cell[src];
                    out[dst + 1] = cell[src + 1];
                    out[dst + 2] = cell[src + 2];
                }
            }
        }

        writeFileSync(path, encodePng(W, H, out));
    }

    it.skipIf(!enabled)('writes contact sheets for baseline and candidates', () => {
        mkdirSync(OUT, { recursive: true });
        sheet(defaultGrammar(createDefaultCatalog()), `${OUT}/sheet_spectrum_hard.png`);
        sheet(withWeights(GENTLE), `${OUT}/sheet_gentle.png`);
        sheet(withWeights(STRONG), `${OUT}/sheet_strong.png`);
    });

    it.skipIf(!enabled)('writes comparison PNGs', () => {
        const catalog = createDefaultCatalog();
        const grammar = defaultGrammar(catalog);
        mkdirSync(OUT, { recursive: true });

        for (let s = 0; s < 6; s++) {
            const seed = createSeed(s * 7919 + 1);
            const expression = generate(catalog, grammar, seed);
            console.log(`seed${s}: ${formatFormula(expression.r)}`);
            for (const mapName of Object.keys(MAPS) as (keyof typeof MAPS)[]) {
                const rgb = render(expression, PALETTES.spectrum, MAPS[mapName]);
                writeFileSync(
                    `${OUT}/seed${s}_spectrum_${mapName}.png`,
                    encodePng(SIZE, SIZE, rgb),
                );
            }
            writeFileSync(
                `${OUT}/seed${s}_mono_hard.png`,
                encodePng(SIZE, SIZE, render(expression, PALETTES.mono, MAPS.hard)),
            );
        }
    });
});

// Usage: node scripts/lab/contact-sheet.ts dataset --out scripts/lab/sheet.png --grammars 3,17,42,8
//    or: node scripts/lab/contact-sheet.ts dataset --start 0 --rows 12
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { loadDataset } from './dataset.ts';
import { encodePng } from './png.ts';

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        out: { type: 'string', default: 'scripts/lab/sheet.png' },
        rows: { type: 'string', default: '12' },
        start: { type: 'string', default: '0' },
        grammars: { type: 'string' },
    },
});

const dataset = loadDataset(positionals[0] ?? 'dataset');
const { size, seedsPerGrammar } = dataset;
const indices = values.grammars
    ? values.grammars.split(',').map(Number)
    : Array.from(
          { length: Math.min(Number(values.rows), dataset.grammars.length - Number(values.start)) },
          (_, i) => Number(values.start) + i,
      );
const width = seedsPerGrammar * size;
const height = indices.length * size;
const sheet = new Uint8Array(width * height * 3);

indices.forEach((grammarIndex, row) => {
    for (let col = 0; col < seedsPerGrammar; col++) {
        const { rgb } = dataset.image(grammarIndex, col);

        for (let y = 0; y < size; y++) {
            const from = y * size * 3;
            const to = ((row * size + y) * width + col * size) * 3;

            sheet.set(rgb.subarray(from, from + size * 3), to);
        }
    }
});

writeFileSync(values.out, encodePng(sheet, width, height));
console.log(`${values.out}: grammars ${indices.join(',')}, ${width}x${height}`);

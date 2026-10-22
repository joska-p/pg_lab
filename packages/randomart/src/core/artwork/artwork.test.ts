import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { createExpression, createNode } from '../expression/expression';
import { nodeKey } from '../expression/key';
import { generate, GENERATOR_VERSION } from '../generator/generator';
import { GRAMMAR_PRESETS } from '../grammar/presets';
import { createSeed } from '../random/seed';
import { ARTWORK_FILE_FORMAT, MAX_ARTWORK_FILE_LENGTH } from './constants';
import { createArtwork, createRenderSettings, fitRenderSettings } from './create';
import { checkProvenance } from './provenance';
import { parseArtworkFile, serializeArtworkFile } from './serialize';
import type { ArtworkData, Artwork } from './types';

const catalog = createDefaultCatalog();

interface Fixture {
    readonly data: ArtworkData;
    readonly artwork: Artwork;
}

/**
 * Fixed artwork: when provenance is on, the expression is really generated from (grammar, seed), so
 * the provenance regenerates it.
 */
function fixture(provenance = true, seed = 12_345): Fixture {
    const grammar = GRAMMAR_PRESETS[0].grammar;

    const expression = provenance
        ? generate(grammar, createSeed(seed))
        : createExpression(
              createNode(catalog, 'x', [], [0, 0, 0]),
              createNode(catalog, 'y', [], [0, 0, 0]),
              createNode(catalog, 'const', [], [0.5]),
          );

    const artwork = createArtwork({
        expression,
        provenance: provenance
            ? { grammar, seed: createSeed(seed), generatorVersion: GENERATOR_VERSION }
            : undefined,
    });
    const data = JSON.parse(serializeArtworkFile(artwork)) as ArtworkData & { expression: unknown };

    expect(data.format).toBe(ARTWORK_FILE_FORMAT);

    return { artwork, data };
}

describe('artwork: createArtwork', () => {
    it('applies the render defaults (1024², 60000 ms) and freezes the artwork', () => {
        const { artwork } = fixture(false);

        expect(artwork.render).toEqual({ width: 1024, height: 1024, loopMs: 60000 });
        expect(Object.isFrozen(artwork)).toBe(true);
        expect(Object.isFrozen(artwork.render)).toBe(true);
    });

    it('rejects out-of-bounds render values', () => {
        const expression = createExpression(
            createNode(catalog, 'x', [], [0, 0, 0]),
            createNode(catalog, 'y', [], [0, 0, 0]),
            createNode(catalog, 'const', [], [0.5]),
        );

        expect(() => createArtwork({ expression, render: { width: 0 } })).toThrow(/render\.width/);
        expect(() => createArtwork({ expression, render: { width: 8193 } })).toThrow(
            /render\.width/,
        );
        expect(() => createArtwork({ expression, render: { width: 1.5 } })).toThrow(
            /render\.width/,
        );
        expect(() => createArtwork({ expression, render: { loopMs: 499 } })).toThrow(
            /render\.loopMs/,
        );
        expect(() => createArtwork({ expression, render: { loopMs: 120001 } })).toThrow(
            /render\.loopMs/,
        );
        expect(() => createArtwork({ expression, render: { loopMs: Number.NaN } })).toThrow(
            /render\.loopMs/,
        );
    });

    it('repairs the title instead of refusing an artwork over it (throw-vs-repair policy)', () => {
        const expression = createExpression(
            createNode(catalog, 'x', [], [0, 0, 0]),
            createNode(catalog, 'y', [], [0, 0, 0]),
            createNode(catalog, 'const', [], [0.5]),
        );

        // Cosmetic metadata: an empty title means "absent", an oversized one is truncated
        // canonically (keep the first MAX_TITLE_LENGTH characters).
        expect(createArtwork({ expression, title: '' }).title).toBeUndefined();
        expect(createArtwork({ expression, title: 'x'.repeat(201) }).title).toHaveLength(200);
        expect(createArtwork({ expression, title: 'Waves' }).title).toBe('Waves');
    });
});

describe('artwork: createRenderSettings', () => {
    it('applies the defaults (1024², 60000 ms) and freezes the result', () => {
        const settings = createRenderSettings();

        expect(settings).toEqual({ width: 1024, height: 1024, loopMs: 60000 });
        expect(Object.isFrozen(settings)).toBe(true);
    });

    it('brings absent fields back to the defaults individually', () => {
        expect(createRenderSettings({ width: 2_048 })).toEqual({
            width: 2_048,
            height: 1024,
            loopMs: 60000,
        });
    });

    it('rejects violations with the `Randomart:` prefix: the type claims, the factory proves', () => {
        expect(() => createRenderSettings({ width: 0 })).toThrow(
            'Randomart: render.width must be an integer in [1, 8192], received 0',
        );
        expect(() => createRenderSettings({ height: 8193 })).toThrow(
            'Randomart: render.height must be an integer in [1, 8192], received 8193',
        );
        expect(() => createRenderSettings({ loopMs: 499 })).toThrow(
            'Randomart: render.loopMs must be between 500 and 120000, received 499',
        );
    });
});

describe('artwork: fitRenderSettings', () => {
    it('repairs out-of-bounds render values by clamping them into the concept bounds', () => {
        expect(fitRenderSettings({ width: 0, height: 9_999, loopMs: 10 })).toEqual({
            width: 1,
            height: 8_192,
            loopMs: 500,
        });
        expect(fitRenderSettings({ loopMs: 130_000 })).toEqual({
            width: 1_024,
            height: 1_024,
            loopMs: 120_000,
        });
    });

    it('routes non-finite fields to the concept defaults: not "min"/"max"', () => {
        expect(fitRenderSettings({ width: Number.NaN, loopMs: Number.NaN })).toEqual({
            width: 1_024,
            height: 1_024,
            loopMs: 60_000,
        });
        expect(fitRenderSettings()).toEqual({
            width: 1_024,
            height: 1_024,
            loopMs: 60_000,
        });
    });
});

describe('artwork: files', () => {
    it('round-trips (expression by nodeKey, the rest by value)', () => {
        const { artwork } = fixture();
        const back = parseArtworkFile(serializeArtworkFile(artwork));

        expect(nodeKey(back.expression.r)).toBe(nodeKey(artwork.expression.r));
        expect(nodeKey(back.expression.g)).toBe(nodeKey(artwork.expression.g));
        expect(nodeKey(back.expression.b)).toBe(nodeKey(artwork.expression.b));
        expect(back.render).toEqual(artwork.render);
        expect(back.provenance?.seed).toBe(artwork.provenance?.seed);
        expect(Object.keys(back.provenance?.grammar ?? {})).toEqual(
            Object.keys(artwork.provenance?.grammar ?? {}),
        );
        expect(back.title).toBeUndefined();
    });

    it('writes canonical text: fixed key order, stable across reads', () => {
        const { artwork } = fixture();
        const text = serializeArtworkFile(artwork);

        // No provenance in this fixture either way: absent optional fields are omitted.
        expect(Object.keys(JSON.parse(text))).toEqual([
            'format',
            'version',
            'render',
            'provenance',
            'expression',
        ]);

        // Round-trip is idempotent: same data → same text (readable diffs in a repository).
        expect(serializeArtworkFile(parseArtworkFile(text))).toBe(text);
    });

    it('omits optional fields and keeps a fixed key order with a title', () => {
        const { artwork } = fixture(false);
        const titled = { ...artwork, title: 'Waves' } as Artwork;
        const text = serializeArtworkFile(titled);

        expect(Object.keys(JSON.parse(text))).toEqual([
            'format',
            'version',
            'title',
            'render',
            'expression',
        ]);
        expect(text).toContain('"title": "Waves"');
    });

    it('rejects a wrong format, version 2 and invalid JSON', () => {
        const { data } = fixture();

        expect(() => parseArtworkFile(JSON.stringify({ ...data, format: 'other' }))).toThrow(
            /format "other" not supported/,
        );
        expect(() => parseArtworkFile(JSON.stringify({ ...data, version: 2 }))).toThrow(
            /version 2 not supported/,
        );
        expect(() => parseArtworkFile(JSON.stringify({ ...data, version: undefined }))).toThrow(
            /version undefined not supported/,
        );
        expect(() => parseArtworkFile('not json at all')).toThrow(/invalid JSON/);
    });

    it('rejects unknown fields with their path', () => {
        const { data } = fixture();

        expect(() => parseArtworkFile(JSON.stringify({ ...data, extra: 1 }))).toThrow(
            /file\.extra: unknown field/,
        );
        expect(() =>
            parseArtworkFile(
                JSON.stringify({ ...data, provenance: { ...data.provenance, extra: 1 } }),
            ),
        ).toThrow(/provenance\.extra: unknown field/);
        expect(() =>
            parseArtworkFile(
                JSON.stringify({
                    ...data,
                    provenance: {
                        ...data.provenance,
                        grammar: { ...data.provenance?.grammar, extra: 0 },
                    },
                }),
            ),
        ).toThrow(/provenance\.grammar\.extra: unknown field/);
    });

    it('repairs out-of-bounds render values instead of refusing the artwork (throw-vs-repair)', () => {
        const { data } = fixture();
        const corrupt = JSON.parse(
            JSON.stringify({ ...data, render: { ...data.render, width: 99_999, loopMs: 300_000 } }),
        );

        const repaired = parseArtworkFile(JSON.stringify(corrupt));

        expect(repaired.render.width).toBe(8_192);
        expect(repaired.render.loopMs).toBe(120_000);
    });

    it('relays deserialize errors with their expression address', () => {
        const { data } = fixture();

        expect(() =>
            parseArtworkFile(JSON.stringify({ ...data, expression: { r: { op: 'abc' } } })),
        ).toThrow(/Expression invalid at r/);
    });

    it('rejects a text over the import limit before parsing it', () => {
        expect(() => parseArtworkFile('x'.repeat(MAX_ARTWORK_FILE_LENGTH + 1))).toThrow(
            /too large/,
        );
    });
});

describe('artwork: provenance', () => {
    it('is "none" without provenance', () => {
        const { artwork } = fixture(false);

        expect(checkProvenance(artwork)).toBe('none');
    });

    it('is "matches" on a regenerated artwork', () => {
        const { artwork } = fixture();

        expect(checkProvenance(artwork)).toBe('matches');
    });

    it('is "differs" after a manual edit of one channel', () => {
        const { artwork, data } = fixture();
        const edited = {
            ...artwork,
            expression: createExpression(
                createNode(catalog, 'add', [
                    createNode(catalog, 'x', [], [0, 0, 0]),
                    createNode(catalog, 'y', [], [0, 0, 0]),
                ]),
                artwork.expression.g,
                artwork.expression.b,
            ),
        };

        expect(checkProvenance(edited)).toBe('differs');

        // The edited artwork keeps its original provenance in the file.
        const editedText = serializeArtworkFile(edited);
        expect(JSON.parse(editedText).provenance.seed).toBe(data.provenance?.seed);
    });

    it('is "version-mismatch" when the generator version differs', () => {
        const { artwork } = fixture();
        const stale: Artwork = {
            ...artwork,
            provenance: artwork.provenance && { ...artwork.provenance, generatorVersion: 999 },
        };

        expect(checkProvenance(stale)).toBe('version-mismatch');
    });
});

import type { Catalog } from '../catalog/index.ts';
import { deserialize, serialize } from '../expression/index.ts';
import type { ExpressionData } from '../expression/index.ts';
import { createGrammar } from '../grammar/index.ts';
import type { Constraints, Grammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';
import type { Seed } from '../random/index.ts';
import { createArtwork } from './create.ts';
import type { Artwork, Provenance, RenderSettings } from './types.ts';

export const ARTWORK_FILE_FORMAT = 'random-art';
export const ARTWORK_FILE_VERSION = 1;
/** Import guard (D35): checked before any `JSON.parse`. */
export const MAX_ARTWORK_FILE_LENGTH = 1_000_000;

// ---------------------------------------------------------------------------
// Grammar files (moved from grammar/serialize.ts: a .randomart-grammar.json file is artwork data)
// ---------------------------------------------------------------------------

export const GRAMMAR_FILE_FORMAT = 'random-art-grammar';
export const GRAMMAR_FILE_VERSION = 1;
/** Import guard (D35): checked before any `JSON.parse`. */
export const MAX_GRAMMAR_FILE_LENGTH = 1_000_000;

export interface GrammarData {
    readonly weights: Readonly<Record<string, number>>;
    readonly constraints: Constraints;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(
    record: Record<string, unknown>,
    allowed: readonly string[],
    path: string,
): void {
    for (const key of Object.keys(record)) {
        if (!allowed.includes(key)) {
            throw new Error(`${path}.${key}: unknown field`);
        }
    }
}

/** Plain JSON object; weight keys in alphabetical order so equal grammars give equal text. */
export function serializeGrammar(grammar: Grammar): GrammarData {
    const weights: Record<string, number> = {};

    for (const name of Object.keys(grammar.weights).sort()) {
        weights[name] = grammar.weights[name];
    }

    const { minDepth, maxDepth, maxNodes } = grammar.constraints;

    return { weights, constraints: { minDepth, maxDepth, maxNodes } };
}

/** Accepts unknown input and validates it through `createGrammar`; errors carry the field path. */
export function deserializeGrammar(catalog: Catalog, data: unknown, path = 'grammar'): Grammar {
    if (!isRecord(data)) {
        throw new Error(`${path}: object expected`);
    }

    rejectUnknownKeys(data, ['weights', 'constraints'], path);

    const rawWeights = data.weights;

    if (!isRecord(rawWeights)) {
        throw new Error(`${path}.weights: object expected`);
    }

    const weights: Record<string, number> = {};

    for (const [name, value] of Object.entries(rawWeights)) {
        if (typeof value !== 'number') {
            throw new Error(`${path}.weights.${name}: number expected`);
        }

        weights[name] = value;
    }

    const rawConstraints = data.constraints;

    if (!isRecord(rawConstraints)) {
        throw new Error(`${path}.constraints: object expected`);
    }

    rejectUnknownKeys(rawConstraints, ['minDepth', 'maxDepth', 'maxNodes'], `${path}.constraints`);

    const readNumber = (key: 'minDepth' | 'maxDepth' | 'maxNodes'): number => {
        const value = rawConstraints[key];

        if (typeof value !== 'number') {
            throw new Error(`${path}.constraints.${key}: number expected`);
        }

        return value;
    };

    const constraints: Constraints = {
        minDepth: readNumber('minDepth'),
        maxDepth: readNumber('maxDepth'),
        maxNodes: readNumber('maxNodes'),
    };

    try {
        return createGrammar(catalog, { weights, constraints });
    } catch (error) {
        throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, {
            cause: error,
        });
    }
}

/** `.randomart-grammar.json` content: format, version, grammar; 2-space indent. */
export function serializeGrammarFile(grammar: Grammar): string {
    return `${JSON.stringify(
        {
            format: GRAMMAR_FILE_FORMAT,
            version: GRAMMAR_FILE_VERSION,
            grammar: serializeGrammar(grammar),
        },
        null,
        2,
    )}\n`;
}

export function parseGrammarFile(catalog: Catalog, text: string): Grammar {
    if (text.length > MAX_GRAMMAR_FILE_LENGTH) {
        throw new Error(
            `Grammar file too large (${text.length} characters, limit ${MAX_GRAMMAR_FILE_LENGTH})`,
        );
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Grammar file: invalid JSON');
    }

    if (!isRecord(parsed)) {
        throw new Error('Grammar file: object expected');
    }

    rejectUnknownKeys(parsed, ['format', 'version', 'grammar'], 'file');

    if (parsed.format !== GRAMMAR_FILE_FORMAT) {
        throw new Error(
            `Grammar file: format ${JSON.stringify(parsed.format)} not supported (expected "${GRAMMAR_FILE_FORMAT}")`,
        );
    }

    if (parsed.version !== GRAMMAR_FILE_VERSION) {
        throw new Error(`Grammar file: version ${String(parsed.version)} not supported`);
    }

    return deserializeGrammar(catalog, parsed.grammar);
}

// ---------------------------------------------------------------------------
// Artwork file (.randomart.json)
// ---------------------------------------------------------------------------

/** `.randomart.json` content; key order: format, version, title, render, provenance, expression. */
export interface ArtworkData {
    readonly format: string;
    readonly version: number;
    readonly title?: string;
    readonly render?: {
        readonly width: number;
        readonly height: number;
        readonly loopMs: number;
    };
    readonly provenance?: {
        readonly generatorVersion: number;
        readonly seed: number;
        readonly grammar: GrammarData;
    };
    readonly expression: ExpressionData;
}

/**
 * Canonical text of an artwork: same data → same text (fixed key order, optional fields omitted,
 * grammar weights sorted, 2-space indent) for readable diffs in a repository.
 */
export function serializeArtwork(artwork: Artwork): string {
    const provenance = artwork.provenance
        ? {
              generatorVersion: artwork.provenance.generatorVersion,
              seed: artwork.provenance.seed,
              grammar: serializeGrammar(artwork.provenance.grammar),
          }
        : undefined;

    const data: ArtworkData = {
        format: ARTWORK_FILE_FORMAT,
        version: ARTWORK_FILE_VERSION,
        ...(artwork.title !== undefined ? { title: artwork.title } : {}),
        render: {
            width: artwork.render.width,
            height: artwork.render.height,
            loopMs: artwork.render.loopMs,
        },
        ...(artwork.provenance !== undefined ? { provenance } : {}),
        expression: serialize(artwork.expression),
    };

    return `${JSON.stringify(data, null, 2)}\n`;
}

function readRender(data: unknown): RenderSettings {
    if (!isRecord(data)) {
        throw new Error('render: object expected');
    }

    rejectUnknownKeys(data, ['width', 'height', 'loopMs'], 'render');

    for (const key of ['width', 'height', 'loopMs'] as const) {
        if (typeof data[key] !== 'number') {
            throw new Error(`render.${key}: number expected`);
        }
    }

    // Types are checked above; createArtwork validates the bounds (integer sizes, finite loopMs)
    // and its messages already carry the render.* field path.
    return {
        width: data.width as number,
        height: data.height as number,
        loopMs: data.loopMs as number,
    };
}

function readProvenance(catalog: Catalog, data: unknown, path = 'provenance'): Provenance {
    if (!isRecord(data)) {
        throw new Error(`${path}: object expected`);
    }

    rejectUnknownKeys(data, ['generatorVersion', 'seed', 'grammar'], path);

    if (typeof data.generatorVersion !== 'number') {
        throw new Error(`${path}.generatorVersion: number expected`);
    }

    if (typeof data.seed !== 'number') {
        throw new Error(`${path}.seed: number expected`);
    }

    if (data.grammar === undefined) {
        throw new Error(`${path}.grammar: object expected`);
    }

    const grammar = deserializeGrammar(catalog, data.grammar, `${path}.grammar`);

    let seed: Seed;

    try {
        seed = createSeed(data.seed);
    } catch (error) {
        throw new Error(`${path}.seed: ${error instanceof Error ? error.message : String(error)}`, {
            cause: error,
        });
    }

    return {
        grammar,
        seed,
        generatorVersion: data.generatorVersion,
    };
}

/**
 * Reads artwork text: format/version guards, unknown fields refused, title/render/provenance
 * validated field by field, the expression through `deserialize` (import limits) — then
 * `createArtwork` as the only constructor.
 */
export function parseArtwork(catalog: Catalog, text: string): Artwork {
    if (text.length > MAX_ARTWORK_FILE_LENGTH) {
        throw new Error(
            `Artwork file too large (${text.length} characters, limit ${MAX_ARTWORK_FILE_LENGTH})`,
        );
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Artwork file: invalid JSON');
    }

    if (!isRecord(parsed)) {
        throw new Error('Artwork file: object expected');
    }

    rejectUnknownKeys(
        parsed,
        ['format', 'version', 'title', 'render', 'provenance', 'expression'],
        'file',
    );

    if (parsed.format !== ARTWORK_FILE_FORMAT) {
        throw new Error(
            `Artwork file: format ${JSON.stringify(parsed.format)} not supported (expected "${ARTWORK_FILE_FORMAT}")`,
        );
    }

    if (parsed.version !== ARTWORK_FILE_VERSION) {
        throw new Error(`Artwork file: version ${String(parsed.version)} not supported`);
    }

    if (parsed.title !== undefined && typeof parsed.title !== 'string') {
        throw new Error('file.title: string expected');
    }

    return createArtwork({
        expression: deserialize(catalog, parsed.expression),
        ...(parsed.render !== undefined ? { render: readRender(parsed.render) } : {}),
        ...(parsed.provenance !== undefined
            ? { provenance: readProvenance(catalog, parsed.provenance) }
            : {}),
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
    });
}

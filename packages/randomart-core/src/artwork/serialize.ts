import type { Catalog } from '../catalog/Catalog';
import { isColorSpaceId } from '../color/color';
import { isSizeProfileId } from '../config/config';
import type { ColorSpaceId, SizeProfileId } from '../config/types';
import { deserialize, serialize } from '../expression/serialize';
import type { ExpressionData } from '../expression/serialize';
import { createGrammar, weightOf } from '../grammar/grammar';
import type { Grammar } from '../grammar/types';
import { createSeed } from '../random/seed';
import type { Seed } from '../random/seed';
import { isRecord, rejectUnknownKeys } from '../shared/shared';
import { createArtwork, fitRenderSettings } from './create';
import type { Artwork, Provenance, RenderSettingsInput } from './types';

export const ARTWORK_FILE_FORMAT = 'random-art';
const ARTWORK_FILE_VERSION = 1;
/** Import guard: checked before any `JSON.parse`. */
export const MAX_ARTWORK_FILE_LENGTH = 1_000_000;

export interface GrammarData {
    readonly weights: Readonly<Record<string, number>>;
    readonly size: SizeProfileId;
    readonly shareDepth: number;
    readonly space: ColorSpaceId;
}

/** Plain JSON object; weight keys in alphabetical order so equal grammars give equal text. */
export function serializeGrammar(grammar: Grammar): GrammarData {
    const weights: Record<string, number> = {};

    for (const name of Object.keys(grammar.weights).sort()) {
        weights[name] = weightOf(grammar.weights, name);
    }

    return {
        weights,
        size: grammar.size,
        shareDepth: grammar.shareDepth,
        space: grammar.space,
    };
}

/** Accepts unknown input and validates it through `createGrammar`; errors carry the field path. */
export function deserializeGrammar(catalog: Catalog, data: unknown, path = 'grammar'): Grammar {
    if (!isRecord(data)) {
        throw new Error(`${path}: object expected`);
    }

    rejectUnknownKeys(data, ['weights', 'size', 'shareDepth', 'space'], path);

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

    if (!isSizeProfileId(data.size)) {
        throw new Error(`${path}.size: unknown size profile ${JSON.stringify(data.size)}`);
    }

    if (typeof data.shareDepth !== 'number') {
        throw new Error(`${path}.shareDepth: number expected`);
    }

    if (!isColorSpaceId(data.space)) {
        throw new Error(`${path}.space: unknown color space ${JSON.stringify(data.space)}`);
    }

    if (!Number.isFinite(data.shareDepth)) {
        throw new Error(`${path}.shareDepth: finite number expected`);
    }

    try {
        return createGrammar(catalog, {
            weights,
            size: data.size,
            shareDepth: data.shareDepth,
            space: data.space,
        });
    } catch (error) {
        throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, {
            cause: error,
        });
    }
}

/** `.randomart.json` content; key order: format, version, title, render, provenance, expression. */
export interface ArtworkData {
    readonly format: string;
    readonly version: number;
    readonly title?: string;
    readonly render?: RenderSettingsInput;
    readonly provenance?: {
        readonly generatorVersion: number;
        readonly seed: number;
        readonly grammar: GrammarData;
    };
    readonly expression: ExpressionData;
}

/**
 * Canonical text of an artwork: key order format, version, title, render, provenance, expression;
 * absent optional fields are omitted; grammar weights sorted; 2-space indent. One version (1), no
 * migration: an unknown version is refused. Unknown fields are refused so a future file never
 * passes as version 1.
 *
 * Example: { "format": "random-art", "version": 1, "render": { ... }, "expression": { "r": { "op":
 * "x" }, ... } }
 */
export function serializeArtworkFile(artwork: Artwork): string {
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

/**
 * Shape-checks the `render` field of a file (unknown fields refused, numbers expected) — the raw
 * JSON numbers are then _repaired_, not bounds-checked, by `fitRenderSettings` (throw-vs-repair
 * policy in shared/index.ts: structure and types refuse, editing quantities clamp).
 */
function readRender(data: unknown): RenderSettingsInput {
    if (!isRecord(data)) {
        throw new Error('render: object expected');
    }

    rejectUnknownKeys(data, ['width', 'height', 'loopMs'], 'render');

    for (const key of ['width', 'height', 'loopMs'] as const) {
        if (typeof data[key] !== 'number') {
            throw new Error(`render.${key}: number expected`);
        }
    }

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
 *
 * Key order: format, version, title, render, provenance, expression; absent optional fields are
 * omitted; 2-space indent. One version (1), no migration: an unknown version is refused. Unknown
 * fields are refused so a future file never passes as version 1.
 */
export function parseArtworkFile(catalog: Catalog, text: string): Artwork {
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
        // Clamp out-of-bounds quantities at file boundary so external files still render.
        ...(parsed.render !== undefined
            ? { render: fitRenderSettings(readRender(parsed.render)) }
            : {}),
        ...(parsed.provenance !== undefined
            ? { provenance: readProvenance(catalog, parsed.provenance) }
            : {}),
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
    });
}

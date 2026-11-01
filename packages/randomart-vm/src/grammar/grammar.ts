import type { Catalog } from '../isa/catalog';
import { assertIntegerInRange } from '../shared/asserts';
import { MIN_SHARE_DEPTH } from '../spec/constants';
import { GrammarError } from '../spec/errors';
import { SIZE_PROFILES } from './constants';
import type { Grammar, GrammarWeights, SizeConstraints, SizeProfile } from './types';

export function isSizeProfile(s: string): s is SizeProfile {
    return s === 'tiny' || s === 'small' || s === 'medium' || s === 'large';
}

export function constraintsOf(size: SizeProfile): SizeConstraints {
    return SIZE_PROFILES[size];
}

export function weightOf(weights: GrammarWeights, name: string): number {
    const w = weights[name];
    return typeof w === 'number' && Number.isFinite(w) ? w : 0;
}

function clampInt(v: number, min: number, max: number, fallback: number): number {
    if (!Number.isFinite(v)) {
        return fallback;
    }
    const r = Math.round(v);
    if (r < min) {
        return min;
    }
    if (r > max) {
        return max;
    }
    return r;
}

function generateGrammarId(
    weights: GrammarWeights,
    size: SizeProfile,
    shareDepth: number,
    space: string,
): string {
    const parts: string[] = [];
    const keys = Object.keys(weights).sort();
    for (const k of keys) {
        parts.push(`${k}:${weightOf(weights, k)}`);
    }
    const s = `${parts.join('|')}|${size}|${shareDepth}|${space}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return `vm-${Math.abs(h).toString(36)}`;
}

export function createGrammar(
    catalog: Catalog,
    opts: {
        label?: string;
        description?: string;
        weights: GrammarWeights;
        size: SizeProfile;
        shareDepth: number;
        space?: string;
    },
): Grammar {
    const { weights, size } = opts;
    const space = opts.space ?? 'raw';

    if (!isSizeProfile(size)) {
        throw new GrammarError(`Unknown size profile: ${size}`);
    }

    const keys = Object.keys(weights);
    if (keys.length === 0) {
        throw new GrammarError('Grammar weights must not be empty');
    }

    for (const k of keys) {
        if (!catalog.has(k)) {
            throw new GrammarError(`Unknown operator in grammar: ${k}`);
        }
    }

    for (const [k, w] of Object.entries(weights)) {
        if (w === undefined) {
            continue;
        }
        assertIntegerInRange(w, `weight of ${k}`, 0, 4);
    }

    const vocab = catalog.operators().filter((op) => weightOf(weights, op.name) > 0);
    if (vocab.length === 0) {
        throw new GrammarError('Grammar vocabulary is empty');
    }
    if (!vocab.some((op) => op.isTerminal)) {
        throw new GrammarError('Grammar must have at least one terminal');
    }
    if (!vocab.some((op) => !op.isTerminal)) {
        throw new GrammarError('Grammar must have at least one non-terminal');
    }

    const cons = constraintsOf(size);
    const shareDepthClamped = clampInt(
        opts.shareDepth,
        MIN_SHARE_DEPTH,
        cons.maxDepth,
        Math.min(1, cons.maxDepth),
    );

    // sort weights
    const sorted: Record<string, number> = {};
    for (const k of [...keys].sort()) {
        sorted[k] = weightOf(weights, k);
    }

    return Object.freeze({
        id: generateGrammarId(sorted, size, shareDepthClamped, space),
        label: opts.label ?? 'VM Grammar',
        description: opts.description ?? 'VM generated grammar',
        weights: Object.freeze(sorted),
        size,
        shareDepth: shareDepthClamped,
        space,
    }) as Grammar;
}

export function getVocabulary(catalog: Catalog, weights: GrammarWeights) {
    return catalog
        .operators()
        .filter((op) => weightOf(weights, op.name) > 0)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

export function isTerminal(op: any) {
    return op?.isTerminal === true;
}

export function isNonTerminal(op: any) {
    return op?.isTerminal === false;
}

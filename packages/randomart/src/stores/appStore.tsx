import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { createDefaultCatalog } from '../core/catalog/index.ts';
import { compile } from '../core/compiler/index.ts';
import type { CompiledShader } from '../core/compiler/index.ts';
import { createExpression } from '../core/expression/index.ts';
import type { Address, Expression, Node } from '../core/expression/index.ts';
import { generate } from '../core/generator/index.ts';
import {
    createGrammar,
    defaultGrammar,
    describeGrammar,
    fitConstraints,
    getVocabulary,
    parseGrammarFile,
    randomizeWeights,
    serializeGrammarFile,
} from '../core/grammar/index.ts';
import type { Constraints, Grammar, GrammarSummary } from '../core/grammar/index.ts';
import { createRng, createSeed, randomSeed } from '../core/random/index.ts';
import type { Rng, Seed } from '../core/random/index.ts';
import { DEFAULT_LOOP_DURATION } from '../renderer/contract';

/** One explored state: enough to get the exact same image back (same generator version). */
export interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
}

const HISTORY_LIMIT = 30;

const catalog = createDefaultCatalog();

// Time terminals are always in the default vocabulary: one seed = one expression = one shader.
// Animation is a matter of playback (Play/Pause on the clock), not of grammar.
const initialGrammar = defaultGrammar(catalog);
const initialSeed = createSeed(42);
const initialExpression = generate(catalog, initialGrammar, initialSeed);
const initialCompiled = compile(catalog, initialExpression);
const initialEntry: HistoryEntry = {
    id: 0,
    seed: initialSeed,
    grammar: initialGrammar,
    nodes: initialCompiled.stats.nodes,
};

let nextEntryId = 1;

/** Id of the history entry created by the current run of constraint edits, if any. */
let constraintEditId: number | null = null;

interface AppStoreState {
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    /**
     * Message of the last failed exploration action (generate/compile/import); null after a
     * success.
     */
    actionError: string | null;
    duration: DurationSeconds;
    grammar: Grammar;
    grammarSummary: GrammarSummary;
    history: readonly HistoryEntry[];
    currentId: number;
    seed: Seed;
    expression: Expression;
    /** Node picked in the inspector; reset whenever the expression changes. */
    selected: Address | null;
    compiledShader: CompiledShader;
    canvas: HTMLCanvasElement | null;
}

const nullClockStore = createNullClockStore();

const store = create<AppStoreState>(() => ({
    clockStore: nullClockStore,
    shaderError: null,
    actionError: null,
    duration: DEFAULT_LOOP_DURATION,
    grammar: initialGrammar,
    grammarSummary: describeGrammar(catalog, initialGrammar),
    history: [initialEntry],
    currentId: initialEntry.id,
    seed: initialSeed,
    expression: initialExpression,
    selected: null,
    compiledShader: initialCompiled,
    canvas: null,
}));

// ---------------------------------------------------------------------------
// Simple state accessors
// ---------------------------------------------------------------------------

export function useClockStore(): ClockStore {
    return store((s) => s.clockStore);
}

export function setClockStore(clockStore: ClockStore): void {
    store.setState({ clockStore });
}

export function useHasClockStore(): boolean {
    return store((s) => s.clockStore !== nullClockStore);
}

export function useShaderError(): ShaderError | null {
    return store((s) => s.shaderError);
}

export function setShaderError(shaderError: ShaderError | null): void {
    store.setState({ shaderError });
}

export function useActionError(): string | null {
    return store((s) => s.actionError);
}

export function useDuration(): DurationSeconds {
    return store((s) => s.duration);
}

/** Updates the loop duration in the store and in the live clockStore (preserves progress). */
export function setDuration(duration: DurationSeconds): void {
    store.getState().clockStore.setDuration(duration);
    store.setState({ duration });
}

export function useSeed(): Seed {
    return store((s) => s.seed);
}

export function useExpression(): Expression {
    return store((s) => s.expression);
}

export function useSelected(): Address | null {
    return store((s) => s.selected);
}

export function selectNode(selected: Address | null): void {
    store.setState({ selected });
}

/**
 * Compiles one subtree on its own, in the root coordinate context, as a grayscale picture (`r = g =
 * b = node`). Known limit: the deformation of the node's ancestors (e.g. `warp`) is not part of the
 * preview.
 */
export function compileNodePreview(node: Node): CompiledShader {
    return compile(catalog, createExpression(node, node, node));
}

export function useCompiledShader(): CompiledShader {
    return store((s) => s.compiledShader);
}

export function useCanvas(): HTMLCanvasElement | null {
    return store((s) => s.canvas);
}

export function setCanvas(canvas: HTMLCanvasElement): void {
    store.setState({ canvas });
}

export function useGrammarSummary(): GrammarSummary {
    return store((s) => s.grammarSummary);
}

export function useGrammar(): Grammar {
    return store((s) => s.grammar);
}

export function useHistory(): readonly HistoryEntry[] {
    return store((s) => s.history);
}

export function useCurrentId(): number {
    return store((s) => s.currentId);
}

// ---------------------------------------------------------------------------
// Exploration
// ---------------------------------------------------------------------------

function setActionError(error: unknown): void {
    store.setState({ actionError: error instanceof Error ? error.message : String(error) });
}

/**
 * The single write point for "a new image": generate → compile → publish, all or nothing. On
 * failure (compiler guard, bug, bad import) the previous state is kept and the error is shown.
 * Without `restoreId` a new history entry is recorded; with it, the entry is simply re-selected.
 * With `coalesce`, consecutive calls (typing in a constraint field) replace each other's entry
 * instead of flooding the history.
 */
function commit(grammar: Grammar, seed: Seed, restoreId?: number, coalesce = false): void {
    try {
        const expression = generate(catalog, grammar, seed);
        const compiledShader = compile(catalog, expression);
        const state = store.getState();
        let { history } = state;
        let currentId: number;

        if (restoreId === undefined) {
            const entry: HistoryEntry = {
                id: nextEntryId++,
                seed,
                grammar,
                nodes: compiledShader.stats.nodes,
            };

            const replaces = coalesce && constraintEditId === state.currentId;
            const kept = replaces
                ? history.filter((candidate) => candidate.id !== state.currentId)
                : history;

            history = [entry, ...kept].slice(0, HISTORY_LIMIT);
            currentId = entry.id;
            constraintEditId = coalesce ? entry.id : null;
        } else {
            currentId = restoreId;
            constraintEditId = null;
        }

        store.setState({
            grammar,
            grammarSummary: describeGrammar(catalog, grammar),
            seed,
            expression,
            selected: null,
            compiledShader,
            history,
            currentId,
            actionError: null,
        });
    } catch (error) {
        setActionError(error);
    }
}

/** "Nouvelle image": the seed changes, the grammar stays. */
export function newImage(nextSeed: Seed = randomSeed()): void {
    commit(store.getState().grammar, nextSeed);
}

/**
 * Grammar explorations keep the seed (glossary: only the grammar dimensions change), so the effect
 * of the new grammar is comparable on the "same" seed.
 */
function exploreGrammar(randomize: (grammar: Grammar, rng: Rng) => Grammar): void {
    try {
        const { grammar, seed } = store.getState();

        commit(randomize(grammar, createRng(randomSeed())), seed);
    } catch (error) {
        setActionError(error);
    }
}

/** "New weights": scaling and on/off, constraints unchanged. */
export function newDistribution(): void {
    exploreGrammar((grammar, rng) => randomizeWeights(catalog, grammar, rng));
}

/**
 * Edits the constraints by hand (the UI owns them; they are never randomized). `fitConstraints`
 * keeps them valid for the current vocabulary, so the sliders can never produce an error.
 */
export function setConstraints(partial: Partial<Constraints>): void {
    const { grammar, seed } = store.getState();
    const merged: Constraints = { ...grammar.constraints, ...partial };
    // Raising minDepth past maxDepth drags maxDepth along; the opposite is fitConstraints' job.
    const wanted: Constraints =
        partial.minDepth !== undefined &&
        partial.maxDepth === undefined &&
        merged.minDepth > merged.maxDepth
            ? { ...merged, maxDepth: merged.minDepth }
            : merged;
    const constraints = fitConstraints(getVocabulary(catalog, grammar.weights), wanted);

    // Coalesced: typing "12" in a field is one history entry, not two.
    commit(
        createGrammar(catalog, { weights: grammar.weights, constraints }),
        seed,
        undefined,
        true,
    );
}

/** Back to the default grammar, same seed. */
export function resetGrammar(): void {
    commit(defaultGrammar(catalog), store.getState().seed);
}

export function restoreEntry(id: number): void {
    const entry = store.getState().history.find((candidate) => candidate.id === id);

    if (entry) {
        commit(entry.grammar, entry.seed, entry.id);
    }
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();
    // The download starts after click() returns: defer the revocation.
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/** Exports the current grammar as a versioned JSON file. */
export function exportGrammarFile(): void {
    const text = serializeGrammarFile(store.getState().grammar);

    downloadBlob(
        new Blob([text], { type: 'application/json' }),
        `randomart-${Date.now()}.randomart-grammar.json`,
    );
}

/** Imports a grammar file; keeps the current seed. Invalid files leave the state untouched. */
export async function importGrammarFile(file: File): Promise<void> {
    try {
        const grammar = parseGrammarFile(catalog, await file.text());

        commit(grammar, store.getState().seed);
    } catch (error) {
        setActionError(error);
    }
}

/** Exports the current canvas as a PNG blob. Requires preserveDrawingBuffer: true. */
export async function exportPng(): Promise<void> {
    const { canvas } = store.getState();

    if (!canvas) {
        return;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (!blob) {
        return;
    }

    downloadBlob(blob, `randomart-${Date.now()}.png`);
}

/** Parses a raw string into a valid DurationSeconds (clamps to [1, 60]). */
export function parseDurationInput(raw: string): DurationSeconds {
    const n = parseFloat(raw);
    const clamped = Number.isFinite(n) ? Math.min(60, Math.max(1, n)) : 8;

    return createDurationSeconds(clamped);
}

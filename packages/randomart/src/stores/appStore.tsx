import { createDurationSeconds, type DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { createDefaultCatalog } from '../core/catalog/index.ts';
import { compile, type CompiledShader } from '../core/compiler/index.ts';
import type { Expression } from '../core/expression/index.ts';
import { generate } from '../core/generator/index.ts';
import {
    animatedGrammar,
    describeGrammar,
    type Grammar,
    type GrammarSummary,
    parseGrammarFile,
    randomizeGrammar,
    randomizeVocabulary,
    randomizeWeights,
    serializeGrammarFile,
} from '../core/grammar/index.ts';
import { createRng, createSeed, randomSeed, type Rng, type Seed } from '../core/random/index.ts';
import { DEFAULT_LOOP_DURATION } from '../renderer/contract';

type Theme = 'light' | 'dark' | 'system';

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
const initialGrammar = animatedGrammar(catalog);
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

interface AppStoreState {
    theme: Theme;
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
    compiledShader: CompiledShader;
    fragmentShader: string;
    canvas: HTMLCanvasElement | null;
}

const nullClockStore = createNullClockStore();

const store = create<AppStoreState>(() => ({
    theme: 'dark',
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
    compiledShader: initialCompiled,
    fragmentShader: initialCompiled.source,
    canvas: null,
}));

// ---------------------------------------------------------------------------
// Simple state accessors
// ---------------------------------------------------------------------------

export function useTheme(): Theme {
    return store((s) => s.theme);
}

export function setTheme(theme: Theme): void {
    store.setState({ theme });
}

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

export function useCompiledShader(): CompiledShader {
    return store((s) => s.compiledShader);
}

export function useFragmentShader(): string {
    return store((s) => s.fragmentShader);
}

export function setFragmentShader(fragmentShader: string): void {
    store.setState({ fragmentShader });
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
 */
function commit(grammar: Grammar, seed: Seed, restoreId?: number): void {
    try {
        const expression = generate(catalog, grammar, seed);
        const compiledShader = compile(catalog, expression);
        let { history } = store.getState();
        let currentId: number;

        if (restoreId === undefined) {
            const entry: HistoryEntry = {
                id: nextEntryId++,
                seed,
                grammar,
                nodes: compiledShader.stats.nodes,
            };

            history = [entry, ...history].slice(0, HISTORY_LIMIT);
            currentId = entry.id;
        } else {
            currentId = restoreId;
        }

        store.setState({
            grammar,
            grammarSummary: describeGrammar(catalog, grammar),
            seed,
            expression,
            compiledShader,
            fragmentShader: compiledShader.source,
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

/** "Nouvelle distribution": weights only. */
export function newDistribution(): void {
    exploreGrammar((grammar, rng) => randomizeWeights(catalog, grammar, rng));
}

/** "Nouveau vocabulaire": operators in/out, constraints unchanged. */
export function newVocabulary(): void {
    exploreGrammar((grammar, rng) => randomizeVocabulary(catalog, grammar, rng));
}

/** "Nouvelle grammaire": vocabulary, weights and constraints. */
export function newGrammar(): void {
    exploreGrammar((grammar, rng) => randomizeGrammar(catalog, grammar, rng));
}

/** Back to the default preset, same seed. */
export function resetGrammar(): void {
    commit(animatedGrammar(catalog), store.getState().seed);
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

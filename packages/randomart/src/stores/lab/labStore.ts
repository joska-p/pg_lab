import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import type { ProvenanceCheck } from '../../core/artwork/provenance';
import { MAX_LOOP_MS, MIN_LOOP_MS } from '../../core/artwork/types';
import { catalog } from '../../core/catalog/default';
import type { OperatorId } from '../../core/catalog/operators/registry';
import { compile } from '../../core/compiler/compile';
import type { CompiledShader } from '../../core/compiler/types';
import { CONFIG } from '../../core/config/config';
import type { ColorSpaceId, SizeProfileId } from '../../core/config/types';
import type { Expression } from '../../core/expression/types';
import { generate } from '../../core/generator/generator';
import { channelModelOf, createGrammar } from '../../core/grammar/grammar';
import { drawGrammar as drawRandomGrammar } from '../../core/grammar/quantized';
import type { Grammar } from '../../core/grammar/types';
import { createRng } from '../../core/random/rng';
import { createSeed, randomSeed } from '../../core/random/seed';
import type { Seed } from '../../core/random/seed';
import { DEFAULT_LOOP_DURATION } from '../../core/renderer/contract/contract';
import {
    getCurrentId,
    getHistoryEntry,
    nextHistoryId,
    pushHistoryEntry,
    selectHistoryEntry,
} from './historyStore';
import type { HistoryEntry } from './historyStore';

interface LabState {
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    actionError: string | null;
    duration: DurationSeconds;
    grammar: Grammar;
    seed: Seed;
    expression: Expression;
    provenanceCheck: ProvenanceCheck;
    compiledShader: CompiledShader;
    canvas: HTMLCanvasElement | null;
}

// No default grammar: the first screen draws one, from the initial seed, so it stays reproducible.
// Animation is a matter of playback (Play/Pause on the clock), not of grammar.
const initialSeed = createSeed(CONFIG.app.initialSeed);
const initialGrammar = drawRandomGrammar(createRng(initialSeed));
const initialExpression = generate(initialGrammar, initialSeed);
const initialCompiled = compile(catalog, initialExpression, {
    channels: channelModelOf(initialGrammar),
});
const initialEntry: HistoryEntry = {
    id: 0,
    seed: initialSeed,
    grammar: initialGrammar,
    nodes: initialCompiled.stats.nodes,
};

const nullClockStore = createNullClockStore();

const store = create<LabState>(() => ({
    clockStore: nullClockStore,
    shaderError: null,
    actionError: null,
    duration: DEFAULT_LOOP_DURATION,
    grammar: initialGrammar,
    seed: initialSeed,
    expression: initialExpression,
    provenanceCheck: 'matches',
    compiledShader: initialCompiled,
    canvas: null,
}));

pushHistoryEntry(initialEntry, false, CONFIG.app.historyLimit);

/**
 * Id of the history entry created by the current run of grammar edits (weights, size, share,
 * space), if any.
 */
let grammarEditId: number | null = null;

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

export function useProvenanceCheck(): ProvenanceCheck {
    return store((s) => s.provenanceCheck);
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

export function useGrammar(): Grammar {
    return store((s) => s.grammar);
}

export function getLabState(): LabState {
    return store.getState();
}

export function setActionError(error: unknown): void {
    store.setState({ actionError: error instanceof Error ? error.message : String(error) });
}

/**
 * The single write point for "a new image": generate → compile → publish, all or nothing. On
 * failure (compiler guard, bug, bad import) the previous state is kept and the error is shown.
 * Without `restoreId` a new history entry is recorded; with it, the entry is simply re-selected.
 * With `coalesce`, consecutive calls (while sliding a grammar knob) replace each other's entry
 * instead of flooding the history.
 */
function commit(
    grammarOrChange: Grammar | (() => Grammar),
    seed: Seed,
    restoreId?: number,
    coalesce = false,
): void {
    try {
        // A thunk keeps editor validation (createGrammar may refuse a gesture) inside the single
        // error boundary, so a refused edit surfaces as actionError instead of escaping a handler.
        const grammar = typeof grammarOrChange === 'function' ? grammarOrChange() : grammarOrChange;
        const expression = generate(grammar, seed);
        const compiledShader = compile(catalog, expression, {
            channels: channelModelOf(grammar),
        });

        if (restoreId === undefined) {
            const entry: HistoryEntry = {
                id: nextHistoryId(),
                seed,
                grammar,
                nodes: compiledShader.stats.nodes,
            };

            const replaces = coalesce && grammarEditId === getCurrentId();

            pushHistoryEntry(entry, replaces, CONFIG.app.historyLimit);
            grammarEditId = coalesce ? entry.id : null;
        } else {
            grammarEditId = null;
            selectHistoryEntry(restoreId);
        }

        store.setState({
            grammar,
            seed,
            expression,
            provenanceCheck: 'matches',
            compiledShader,
            actionError: null,
        });
    } catch (error) {
        setActionError(error);
    }
}

export function resetSeed(nextSeed: Seed = randomSeed()): void {
    commit(store.getState().grammar, nextSeed);
}

export function drawGrammar(): void {
    commit(drawRandomGrammar(createRng(randomSeed())), store.getState().seed);
}

export function generateImage(): void {
    commit(drawRandomGrammar(createRng(randomSeed())), randomSeed());
}

export function applyGrammar(grammar: Grammar): void {
    commit(grammar, store.getState().seed);
}

function editGrammar(change: (grammar: Grammar) => Grammar): void {
    const { grammar, seed } = store.getState();

    commit(() => change(grammar), seed, undefined, true);
}

export function setGrammarWeight(name: OperatorId, weight: number): void {
    editGrammar((grammar) =>
        createGrammar({
            ...grammar,
            weights: { ...grammar.weights, [name]: weight },
        }),
    );
}

export function setGrammarSize(size: SizeProfileId): void {
    editGrammar((grammar) => createGrammar({ ...grammar, size }));
}

export function setGrammarShareDepth(shareDepth: number): void {
    editGrammar((grammar) => createGrammar({ ...grammar, shareDepth }));
}

export function setGrammarSpace(space: ColorSpaceId): void {
    editGrammar((grammar) => createGrammar({ ...grammar, space }));
}

/**
 * Restores an imported artwork by its expression, without regenerating: the expression is the
 * reference, and regeneration would lose a hand-edited import.
 */
function restoreImportedEntry(entry: HistoryEntry): void {
    const expression = entry.expression;

    if (!expression) {
        return;
    }

    try {
        store.setState({
            grammar: entry.grammar,
            seed: entry.seed,
            expression,
            provenanceCheck: entry.provenanceCheck ?? 'differs',
            compiledShader: compile(catalog, expression, {
                channels: channelModelOf(entry.grammar),
            }),
            actionError: null,
        });
        selectHistoryEntry(entry.id);
    } catch (error) {
        setActionError(error);
    }
}

export function restoreEntry(id: number): void {
    const entry = getHistoryEntry(id);

    if (!entry) {
        return;
    }

    // Imported artworks whose provenance does not replay keep their expression.
    if (entry.expression) {
        restoreImportedEntry(entry);
        return;
    }

    commit(entry.grammar, entry.seed, entry.id);
}

/**
 * Publishes an already-compiled artwork into the workspace. Used by artwork imports and by the
 * bench's "open in Lab": the expression is shown as-is, and history records a new entry.
 */
export function publishLabState(published: {
    grammar: Grammar;
    seed: Seed;
    expression: Expression;
    provenanceCheck: ProvenanceCheck;
    compiledShader: CompiledShader;
}): void {
    const entry: HistoryEntry = {
        id: nextHistoryId(),
        seed: published.seed,
        grammar: published.grammar,
        nodes: published.compiledShader.stats.nodes,
        expression: published.expression,
        provenanceCheck: published.provenanceCheck,
    };

    pushHistoryEntry(entry, false, CONFIG.app.historyLimit);
    store.setState({ ...published, actionError: null });
}

/**
 * Parses a raw string into a valid DurationSeconds — a repair entry with the _concept_ bounds: the
 * loop duration has one bound set, the artwork's render bounds, so the UI can now represent
 * anything a file may carry. A non-finite input is garbage, not an intent: it takes the concept
 * default (`DEFAULT_LOOP_DURATION`).
 */
export function parseDurationInput(raw: string): DurationSeconds {
    const n = parseFloat(raw);
    const clamped = Number.isFinite(n)
        ? Math.min(MAX_LOOP_MS / 1000, Math.max(MIN_LOOP_MS / 1000, n))
        : DEFAULT_LOOP_DURATION;

    return createDurationSeconds(clamped);
}

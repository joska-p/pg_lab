import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import {
    checkProvenance,
    createArtwork,
    DEFAULT_LOOP_MS,
    DEFAULT_RENDER_HEIGHT,
    DEFAULT_RENDER_WIDTH,
    MAX_LOOP_MS,
    MIN_LOOP_MS,
    parseArtwork,
    parseGrammarFile,
    serializeArtwork,
    serializeGrammarFile,
} from '../core/artwork/index.ts';
import type { Artwork, ProvenanceCheck } from '../core/artwork/index.ts';
import type { ChannelModel } from '../core/color/index.ts';
import { compile } from '../core/compiler/index.ts';
import type { CompiledShader } from '../core/compiler/index.ts';
import type { Expression } from '../core/expression/index.ts';
import { generate, GENERATOR_VERSION } from '../core/generator/index.ts';
import {
    createGrammar,
    defaultGrammar,
    describeGrammar,
    fitConstraints,
    getVocabulary,
    MAX_WEIGHT,
    randomGrammar,
    randomizeWeights,
} from '../core/grammar/index.ts';
import type { ConstraintsInput, Grammar, GrammarSummary } from '../core/grammar/index.ts';
import { createRng, createSeed, randomSeed } from '../core/random/index.ts';
import type { Rng, Seed } from '../core/random/index.ts';
import { DEFAULT_LOOP_DURATION } from '../renderer/contract.ts';
import { catalog } from './catalogueStore.ts';
/**
 * One explored state: enough to get the exact same image back. Generated entries replay from
 * `(grammar, seed)`; imported artworks keep their expression (it is the reference — D1).
 */
export interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
    /** Present only for imported artworks (their provenance may not replay the expression). */
    readonly expression?: Expression;
    /** Provenance status computed at import; absent for generated entries (they replay). */
    readonly provenanceCheck?: ProvenanceCheck;
}

const HISTORY_LIMIT = 30;

// Time terminals are always in the default vocabulary: one seed = one expression = one shader.
// Animation is a matter of playback (Play/Pause on the clock), not of grammar.
const initialGrammar = defaultGrammar(catalog);
const initialSeed = createSeed(42);
const initialExpression = generate(catalog, initialGrammar, initialSeed);
const initialCompiled = compile(catalog, initialExpression, { channels: initialGrammar.channels });
const initialEntry: HistoryEntry = {
    id: 0,
    seed: initialSeed,
    grammar: initialGrammar,
    nodes: initialCompiled.stats.nodes,
};

let nextEntryId = 1;

/**
 * Id of the history entry created by the current run of grammar edits (constraints, weights), if
 * any.
 */
let grammarEditId: number | null = null;

export type Mode = 'gallery' | 'lab' | 'history';

interface AppStoreState {
    mode: Mode;
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
    /** Provenance status of the current artwork ("matches" unless it was imported). */
    provenanceCheck: ProvenanceCheck;
    compiledShader: CompiledShader;
    canvas: HTMLCanvasElement | null;
}

const nullClockStore = createNullClockStore();

const store = create<AppStoreState>(() => ({
    mode: 'lab',
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
    provenanceCheck: 'matches',
    compiledShader: initialCompiled,
    canvas: null,
}));

export function useMode(): Mode {
    return store((s) => s.mode);
}

export function setMode(mode: Mode): void {
    store.setState({ mode });
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
        const compiledShader = compile(catalog, expression, { channels: grammar.channels });
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

            const replaces = coalesce && grammarEditId === state.currentId;
            const kept = replaces
                ? history.filter((candidate) => candidate.id !== state.currentId)
                : history;

            history = [entry, ...kept].slice(0, HISTORY_LIMIT);
            currentId = entry.id;
            grammarEditId = coalesce ? entry.id : null;
        } else {
            currentId = restoreId;
            grammarEditId = null;
        }

        store.setState({
            grammar,
            grammarSummary: describeGrammar(catalog, grammar),
            seed,
            expression,
            provenanceCheck: 'matches',
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

/**
 * "New weights": redistribution only, the vocabulary is frozen (changeRate 0). Which operators are
 * on is the manual panel's call (`weight > 0`, one SSOT); this gesture explores _inside_ that
 * selection — it never activates or deactivates an operator. Constraints are unchanged.
 */
export function newDistribution(): void {
    exploreGrammar((grammar, rng) => randomizeWeights(catalog, grammar, rng, { changeRate: 0 }));
}

/**
 * Edits the constraints by hand (the UI owns them; they are never randomized). `fitConstraints`
 * keeps them valid for the current vocabulary, so the sliders can never produce an error.
 */
export function setConstraints(partial: Partial<ConstraintsInput>): void {
    const { grammar, seed } = store.getState();

    // A partial edit that is not a finite number is simply not an edit: the field keeps its value
    // (findings F21 — the old UI fallback `? value : 1` invented a value instead). Deliberate and
    // paired with the fact that the raw value is rounded/clamped by the core repair (rounds 1.5 → 2).
    const edited = (value: number | undefined): number | undefined =>
        value !== undefined && Number.isFinite(value) ? value : undefined;
    const editedMinDepth = edited(partial.minDepth);
    const editedMaxDepth = edited(partial.maxDepth);
    const editedMaxNodes = edited(partial.maxNodes);

    const wanted: ConstraintsInput = {
        minDepth: editedMinDepth ?? grammar.constraints.minDepth,
        maxDepth: editedMaxDepth ?? grammar.constraints.maxDepth,
        maxNodes: editedMaxNodes ?? grammar.constraints.maxNodes,
    };

    // Gesture preservation (findings F22): raising minDepth past maxDepth drags maxDepth along so
    // the touched field visibly moves; the opposite direction is the core repair's canonical rule.
    // This is an intent refinement, not an invariant — raising minDepth on its own would be
    // resolved by `createConstraints` anyway (maxDepth wins).
    const want: ConstraintsInput =
        editedMinDepth !== undefined &&
        editedMaxDepth === undefined &&
        wanted.minDepth > wanted.maxDepth
            ? { ...wanted, maxDepth: wanted.minDepth }
            : wanted;

    const constraints = fitConstraints(getVocabulary(catalog, grammar.weights), want);

    // Coalesced: typing "12" in a field is one history entry, not two.
    commit(
        createGrammar(catalog, {
            weights: grammar.weights,
            constraints,
            channels: grammar.channels,
        }),
        seed,
        undefined,
        true,
    );
}

/**
 * Manual weight edit from the vocabulary panel: `weight = 0` switches the operator off, a positive
 * weight switches it on. This is the _second writer_ of `grammar.weights` beside the randomizer —
 * there is deliberately no separate "enabled" state: `weight > 0` is the single source of truth for
 * the vocabulary (`getVocabulary`, findings on SSOT).
 *
 * Throw-vs-repair policy (shared/index.ts): a finite edit is an editing quantity — rounded to 3
 * decimals and clamped into [0, MAX_WEIGHT]; a non-finite edit is garbage, not an intent, and is
 * dropped (F21: the field keeps its value instead of an invented one). What is _content_ stays in
 * `createGrammar` — switching off the last terminal is refused there (F22: the invariant lives in
 * the core). The panel locks that control upfront via `isLastTerminal`, a derived reading of the
 * weights, so the refusal is normally unreachable from the UI.
 */
export function setOperatorWeight(name: string, rawWeight: number): void {
    if (!Number.isFinite(rawWeight)) {
        return;
    }

    const weight = Math.min(MAX_WEIGHT, Math.max(0, Math.round(rawWeight * 1000) / 1000));
    const { grammar, seed } = store.getState();

    try {
        const next = createGrammar(catalog, {
            weights: { ...grammar.weights, [name]: weight },
            constraints: grammar.constraints,
            channels: grammar.channels,
        });

        // Coalesced, like constraint edits: a run of tweaks is one history entry, not one per
        // keystroke.
        commit(next, seed, undefined, true);
    } catch (error) {
        setActionError(error);
    }
}

/**
 * Sets the channel model (colour space and/or shared-trunk depth). The colour space is content
 * (`createGrammar` refuses an unknown id), so a bad id surfaces as `actionError` rather than being
 * repaired; `shareDepth` is an editing quantity, repaired there. Coalesced like the other grammar
 * edits: browsing spaces is one history entry, not one per click.
 *
 * A non-finite `shareDepth` (a numeric field mid-edit, F21) keeps its current value instead of
 * inventing one — the core still repairs whatever reaches it from a file.
 */
export function setChannels(channels: ChannelModel): void {
    const { grammar, seed } = store.getState();
    const shareDepth = Number.isFinite(channels.shareDepth)
        ? channels.shareDepth
        : grammar.channels.shareDepth;

    try {
        const next = createGrammar(catalog, {
            weights: grammar.weights,
            constraints: grammar.constraints,
            channels: { space: channels.space, shareDepth },
        });

        commit(next, seed, undefined, true);
    } catch (error) {
        setActionError(error);
    }
}

/** Back to the default grammar, same seed. */
export function resetGrammar(): void {
    commit(defaultGrammar(catalog), store.getState().seed);
}

/**
 * Applies a grammar chosen in the UI (a built-in recipe), same seed — the play-mode twin of
 * `newDistribution`: the grammar is a given, only the image is replayed.
 */
export function applyGrammar(grammar: Grammar): void {
    commit(grammar, store.getState().seed);
}

/**
 * "Shuffle": a fully random grammar — vocabulary, weights and constraints drawn at once
 * (`randomGrammar`). The seed stays, so the new grammar is comparable to the previous one; the
 * colour model follows the calibrated default so the result is usually readable.
 */
export function shuffleGrammar(): void {
    try {
        commit(randomGrammar(catalog, createRng(randomSeed())), store.getState().seed);
    } catch (error) {
        setActionError(error);
    }
}

/**
 * Restores an imported artwork by its expression, without regenerating: the expression is the
 * reference (D1), and regeneration would lose a hand-edited import.
 */
function restoreImportedEntry(entry: HistoryEntry): void {
    const expression = entry.expression;

    if (!expression) {
        return;
    }

    try {
        store.setState({
            grammar: entry.grammar,
            grammarSummary: describeGrammar(catalog, entry.grammar),
            seed: entry.seed,
            expression,
            provenanceCheck: entry.provenanceCheck ?? 'differs',
            compiledShader: compile(catalog, expression, { channels: entry.grammar.channels }),
            currentId: entry.id,
            actionError: null,
        });
    } catch (error) {
        setActionError(error);
    }
}

export function restoreEntry(id: number): void {
    const entry = store.getState().history.find((candidate) => candidate.id === id);

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

/**
 * Publishes an imported artwork: the expression is shown as-is (D1), the grammar and seed come from
 * its provenance when present, and the liveness of its provenance is computed once. Render size is
 * ignored (friction 8: render size = canvas size until lot G); the loop duration is adopted when
 * the UI bounds allow it.
 */
export function publishArtwork(artwork: Artwork): void {
    const { expression, provenance, render } = artwork;
    const state = store.getState();
    const grammar = provenance?.grammar ?? state.grammar;
    const seed = provenance?.seed ?? state.seed;
    const compiledShader = compile(catalog, expression, { channels: grammar.channels });
    const provenanceCheck = checkProvenance(catalog, artwork);
    const entry: HistoryEntry = {
        id: nextEntryId++,
        seed,
        grammar,
        nodes: compiledShader.stats.nodes,
        expression,
        provenanceCheck,
    };

    store.setState({
        grammar,
        grammarSummary: describeGrammar(catalog, grammar),
        seed,
        expression,
        provenanceCheck,
        compiledShader,
        history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
        currentId: entry.id,
        actionError: null,
    });

    // The file's loop duration is adopted unconditionally now (findings F19/F20): store duration
    // and artwork share one bound set ([0.5, 120] s — the render bounds are the concept bounds),
    // so no valid file value can be silently dropped by narrower UI bounds any more. `render` is a
    // brand: its loopMs is a finite number within the bounds by construction.
    if (render.loopMs / 1000 !== state.duration) {
        setDuration(createDurationSeconds(render.loopMs / 1000));
    }
}

/** Opens a gallery cell (grammar + seed) in Lab mode as an artwork. */
export function openCellInLab(grammar: Grammar, seed: Seed): void {
    const artwork = createArtwork({
        expression: generate(catalog, grammar, seed),
        provenance: { grammar, seed, generatorVersion: GENERATOR_VERSION },
    });
    publishArtwork(artwork);
    setMode('lab');
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

/** Exports the current state as a `.randomart.json` artwork (expression as reference, D1). */
export function exportArtworkFile(): void {
    const state = store.getState();
    const artwork = createArtwork({
        expression: state.expression,
        // Render size = canvas size until lot G (friction 8); the artwork keeps the default
        // 1024² so a file stays meaningful on another screen.
        render: {
            width: DEFAULT_RENDER_WIDTH,
            height: DEFAULT_RENDER_HEIGHT,
            loopMs: Math.round(state.duration * 1000),
        },
        provenance: {
            grammar: state.grammar,
            seed: state.seed,
            generatorVersion: GENERATOR_VERSION,
        },
    });

    downloadBlob(
        new Blob([serializeArtwork(artwork)], { type: 'application/json' }),
        `randomart-${Date.now()}.randomart.json`,
    );
}

/**
 * Imports an artwork file and publishes its expression as-is; invalid files leave the state
 * untouched (the error is shown).
 */
export async function importArtworkFile(file: File): Promise<void> {
    try {
        publishArtwork(parseArtwork(catalog, await file.text()));
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

/**
 * Parses a raw string into a valid DurationSeconds — a repair entry with the _concept_ bounds
 * (findings F19): the loop duration has one bound set, the artwork's render bounds, so the UI can
 * now represent anything a file may carry (findings F20). A non-finite input is garbage, not an
 * intent: it takes the concept default (8 s, the spec default — find D36).
 */
export function parseDurationInput(raw: string): DurationSeconds {
    const n = parseFloat(raw);
    const clamped = Number.isFinite(n)
        ? Math.min(MAX_LOOP_MS / 1000, Math.max(MIN_LOOP_MS / 1000, n))
        : DEFAULT_LOOP_MS / 1000;

    return createDurationSeconds(clamped);
}

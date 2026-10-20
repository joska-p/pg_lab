import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { createArtwork } from '../../core/artwork/create';
import { checkProvenance } from '../../core/artwork/provenance';
import type { ProvenanceCheck } from '../../core/artwork/provenance';
import { parseArtworkFile, serializeArtworkFile } from '../../core/artwork/serialize';
import { MAX_LOOP_MS, MIN_LOOP_MS } from '../../core/artwork/types';
import type { Artwork } from '../../core/artwork/types';
import type { OperatorId } from '../../core/catalog/operators/registry';
import { compile } from '../../core/compiler/compile';
import type { CompiledShader } from '../../core/compiler/types';
import { CONFIG } from '../../core/config/config';
import type { ColorSpaceId, SizeProfileId } from '../../core/config/types';
import type { Expression } from '../../core/expression/types';
import { generate, GENERATOR_VERSION } from '../../core/generator/generator';
import { channelModelOf, createGrammar } from '../../core/grammar/grammar';
import { defaultGrammar } from '../../core/grammar/presets';
import { drawGrammar as drawRandomGrammar } from '../../core/grammar/quantized';
import type { Grammar } from '../../core/grammar/types';
import { createRng } from '../../core/random/rng';
import { createSeed, randomSeed } from '../../core/random/seed';
import type { Seed } from '../../core/random/seed';
import { DEFAULT_LOOP_DURATION } from '../../renderer/contract/contract';
import { catalog } from './catalogStore';

/**
 * One explored state: enough to get the exact same image back. Generated entries replay from
 * `(grammar, seed)`; imported artworks keep their expression (it is the reference).
 */
export interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
    readonly expression?: Expression;
    readonly provenanceCheck?: ProvenanceCheck;
}

// Time terminals are always in the default vocabulary: one seed = one expression = one shader.
// Animation is a matter of playback (Play/Pause on the clock), not of grammar.
const initialGrammar = defaultGrammar(catalog);
const initialSeed = createSeed(CONFIG.app.initialSeed);
const initialExpression = generate(catalog, initialGrammar, initialSeed);
const initialCompiled = compile(catalog, initialExpression, {
    channels: channelModelOf(initialGrammar),
});
const initialEntry: HistoryEntry = {
    id: 0,
    seed: initialSeed,
    grammar: initialGrammar,
    nodes: initialCompiled.stats.nodes,
};

let nextEntryId = 1;

/**
 * Id of the history entry created by the current run of grammar edits (weights, size, share,
 * space), if any.
 */
let grammarEditId: number | null = null;

export type AppMode = 'bench' | 'lab' | 'history';

interface AppStoreState {
    mode: AppMode;
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    actionError: string | null;
    duration: DurationSeconds;
    grammar: Grammar;
    history: readonly HistoryEntry[];
    currentId: number;
    seed: Seed;
    expression: Expression;
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
    history: [initialEntry],
    currentId: initialEntry.id,
    seed: initialSeed,
    expression: initialExpression,
    provenanceCheck: 'matches',
    compiledShader: initialCompiled,
    canvas: null,
}));

export function useMode(): AppMode {
    return store((s) => s.mode);
}

export function setMode(mode: AppMode): void {
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

export function useHistory(): readonly HistoryEntry[] {
    return store((s) => s.history);
}

export function useCurrentId(): number {
    return store((s) => s.currentId);
}

function setActionError(error: unknown): void {
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
        const expression = generate(catalog, grammar, seed);
        const compiledShader = compile(catalog, expression, {
            channels: channelModelOf(grammar),
        });
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

            history = [entry, ...kept].slice(0, CONFIG.app.historyLimit);
            currentId = entry.id;
            grammarEditId = coalesce ? entry.id : null;
        } else {
            currentId = restoreId;
            grammarEditId = null;
        }

        store.setState({
            grammar,
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

export function resetSeed(nextSeed: Seed = randomSeed()): void {
    commit(store.getState().grammar, nextSeed);
}

export function drawGrammar(): void {
    commit(drawRandomGrammar(catalog, createRng(randomSeed())), store.getState().seed);
}

export function generateImage(): void {
    commit(drawRandomGrammar(catalog, createRng(randomSeed())), randomSeed());
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
        createGrammar(catalog, {
            ...grammar,
            weights: { ...grammar.weights, [name]: weight },
        }),
    );
}

export function setGrammarSize(size: SizeProfileId): void {
    editGrammar((grammar) => createGrammar(catalog, { ...grammar, size }));
}

export function setGrammarShareDepth(shareDepth: number): void {
    editGrammar((grammar) => createGrammar(catalog, { ...grammar, shareDepth }));
}

export function setGrammarSpace(space: ColorSpaceId): void {
    editGrammar((grammar) => createGrammar(catalog, { ...grammar, space }));
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
 * Publishes an imported artwork: the expression is shown as-is, the grammar and seed come from its
 * provenance when present, and the liveness of its provenance is computed once. Render size is
 * ignored: render size = canvas size until the artwork is resized; the loop duration is adopted
 * when the UI bounds allow it.
 */
function publishArtwork(artwork: Artwork): void {
    const { expression, provenance, render } = artwork;
    const state = store.getState();
    const grammar = provenance?.grammar ?? state.grammar;
    const seed = provenance?.seed ?? state.seed;
    const compiledShader = compile(catalog, expression, {
        channels: channelModelOf(grammar),
    });
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
        seed,
        expression,
        provenanceCheck,
        compiledShader,
        history: [entry, ...state.history].slice(0, CONFIG.app.historyLimit),
        currentId: entry.id,
        actionError: null,
    });

    // Adopt loop duration directly; render.loopMs is already validated within bounds.
    if (render.loopMs / 1000 !== state.duration) {
        setDuration(createDurationSeconds(render.loopMs / 1000));
    }
}

export function openCellInLab(grammar: Grammar, seed: Seed): void {
    const artwork = createArtwork({
        expression: generate(catalog, grammar, seed),
        provenance: { grammar, seed, generatorVersion: GENERATOR_VERSION },
    });
    publishArtwork(artwork);
    setMode('lab');
}

export function exportArtworkFile(): void {
    const state = store.getState();
    const artwork = createArtwork({
        expression: state.expression,
        // Retains default render size so exported files stay consistent across displays.
        render: {
            width: CONFIG.artwork.width,
            height: CONFIG.artwork.height,
            loopMs: Math.round(state.duration * 1000),
        },
        provenance: {
            grammar: state.grammar,
            seed: state.seed,
            generatorVersion: GENERATOR_VERSION,
        },
    });

    downloadBlob(
        new Blob([serializeArtworkFile(artwork)], { type: 'application/json' }),
        `randomart-${Date.now()}.randomart.json`,
    );
}

/**
 * Imports an artwork file and publishes its expression as-is; invalid files leave the state
 * untouched (the error is shown).
 */
export async function importArtworkFile(file: File): Promise<void> {
    try {
        publishArtwork(parseArtworkFile(catalog, await file.text()));
    } catch (error) {
        setActionError(error);
    }
}

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

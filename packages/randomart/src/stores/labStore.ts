import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';

import { createArtwork } from '../core/artwork/create';
import { checkProvenance } from '../core/artwork/provenance';
import { parseArtworkFile, serializeArtworkFile } from '../core/artwork/serialize';
import type { ProvenanceCheck, Artwork } from '../core/artwork/types';
import { catalog } from '../core/catalog/default';
import type { OperatorId } from '../core/catalog/types';
import { compile } from '../core/compiler/compile';
import type { CompiledShader } from '../core/compiler/types';
import { CONFIG } from '../core/config/config';
import {
    DEFAULT_LOOP_DURATION,
    MAX_LOOP_DURATION,
    MIN_LOOP_DURATION,
} from '../core/config/derived';
import type { ColorSpaceId, SizeProfileId } from '../core/config/types';
import type { Expression } from '../core/expression/types';
import { generate, GENERATOR_VERSION } from '../core/generator/generator';
import { channelModelOf, createGrammar } from '../core/grammar/grammar';
import { drawGrammar as drawRandomGrammar } from '../core/grammar/quantized';
import type { Grammar } from '../core/grammar/types';
import { createRng } from '../core/random/rng';
import { createSeed, randomSeed } from '../core/random/seed';
import type { Seed } from '../core/random/types';

interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
    readonly expression?: Expression;
    readonly provenanceCheck?: ProvenanceCheck;
}

interface LabState {
    // Clock & playback
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    actionError: string | null;
    duration: DurationSeconds;

    // Current artwork
    grammar: Grammar;
    seed: Seed;
    expression: Expression;
    provenanceCheck: ProvenanceCheck;
    compiledShader: CompiledShader;
    canvas: HTMLCanvasElement | null;

    // History
    history: readonly HistoryEntry[];
    currentId: number;
    nextEntryId: number;
    grammarEditId: number | null;
}

// No default grammar: first screen draws from initial seed (reproducible). Animation = clock playback, not grammar.
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
    history: [initialEntry],
    currentId: 0,
    nextEntryId: 1,
    grammarEditId: null,
}));

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
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

/**
 * Playback is owned by the clock store; this bridges its subscription into React. Kept here so Toy
 * and Lab read the same truth instead of duplicating the subscription wiring.
 */
export function useIsPlaying(): boolean {
    const clockStore = useClockStore();

    return useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );
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

/** True when the current shader drives `u_phase` and a live clock is mounted. */
export function useCanAnimate(): boolean {
    const hasClockStore = useHasClockStore();
    const compiledShader = useCompiledShader();

    return hasClockStore && compiledShader.animated;
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

export function getLabState() {
    return store.getState();
}

export function setActionError(error: unknown): void {
    store.setState({ actionError: error instanceof Error ? error.message : String(error) });
}

/**
 * Single write point for "new image": generate → compile → publish, all or nothing. On failure,
 * keeps previous state. `restoreId` re-selects entry; `coalesce` replaces consecutive edits.
 */
function commit(
    grammarOrChange: Grammar | (() => Grammar),
    seed: Seed,
    restoreId?: number,
    coalesce = false,
): void {
    try {
        // Thunk keeps editor validation (createGrammar may refuse) inside single error boundary.
        const grammar = typeof grammarOrChange === 'function' ? grammarOrChange() : grammarOrChange;
        const expression = generate(grammar, seed);
        const compiledShader = compile(catalog, expression, {
            channels: channelModelOf(grammar),
        });

        if (restoreId === undefined) {
            const entry: HistoryEntry = {
                id: store.getState().nextEntryId,
                seed,
                grammar,
                nodes: compiledShader.stats.nodes,
            };

            const state = store.getState();
            const replaces = coalesce && state.grammarEditId === state.currentId;

            const kept = replaces
                ? state.history.filter((candidate) => candidate.id !== state.currentId)
                : state.history;

            store.setState({
                history: [entry, ...kept].slice(0, CONFIG.app.historyLimit),
                currentId: entry.id,
                nextEntryId: state.nextEntryId + 1,
                grammarEditId: coalesce ? entry.id : null,
            });
        } else {
            store.setState({ grammarEditId: null, currentId: restoreId });
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

/** Restores imported artwork by expression (no regeneration; would lose hand-edited import). */
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
        store.setState({ currentId: entry.id });
    } catch (error) {
        setActionError(error);
    }
}

export function restoreEntry(id: number): void {
    const entry = store.getState().history.find((candidate) => candidate.id === id);

    if (!entry) {
        return;
    }

    // Imported artworks with non-replaying provenance keep their expression.
    if (entry.expression) {
        restoreImportedEntry(entry);
        return;
    }

    commit(entry.grammar, entry.seed, entry.id);
}

/**
 * Publishes compiled artwork (imports, bench "open in Lab"): expression shown as-is, new history
 * entry.
 */
export function publishLabState(published: {
    grammar: Grammar;
    seed: Seed;
    expression: Expression;
    provenanceCheck: ProvenanceCheck;
    compiledShader: CompiledShader;
}): void {
    const entry: HistoryEntry = {
        id: store.getState().nextEntryId,
        seed: published.seed,
        grammar: published.grammar,
        nodes: published.compiledShader.stats.nodes,
        expression: published.expression,
        provenanceCheck: published.provenanceCheck,
    };

    const state = store.getState();
    store.setState({
        history: [entry, ...state.history].slice(0, CONFIG.app.historyLimit),
        currentId: entry.id,
        nextEntryId: state.nextEntryId + 1,
        ...published,
        actionError: null,
    });
}

/**
 * Publishes an imported artwork: the expression is shown as-is, the grammar and seed come from its
 * provenance when present, and the liveness of its provenance is computed once. Render size is
 * ignored: render size = canvas size until the artwork is resized; the loop duration is adopted
 * when the UI bounds allow it.
 */
export function publishArtwork(artwork: Artwork): void {
    const { expression, provenance, render } = artwork;
    const state = store.getState();
    const grammar = provenance?.grammar ?? state.grammar;
    const seed = provenance?.seed ?? state.seed;
    const compiledShader = compile(catalog, expression, {
        channels: channelModelOf(grammar),
    });
    const provenanceCheck = checkProvenance(artwork);

    publishLabState({ grammar, seed, expression, provenanceCheck, compiledShader });

    // Adopt loop duration directly; render.loopMs is already validated within bounds.
    if (render.loopMs / 1000 !== state.duration) {
        setDuration(createDurationSeconds(render.loopMs / 1000));
    }
}

/** Publishes `(grammar, seed)` as a fresh artwork: the bench's "open in Lab" entry point. */
export function openCellInLab(grammar: Grammar, seed: Seed): void {
    const artwork = createArtwork({
        expression: generate(grammar, seed),
        provenance: { grammar, seed, generatorVersion: GENERATOR_VERSION },
    });

    publishArtwork(artwork);
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
        publishArtwork(parseArtworkFile(await file.text()));
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
 * Parses string to DurationSeconds with concept bounds (artwork render bounds). Non-finite →
 * default.
 */
export function parseDurationInput(raw: string): DurationSeconds {
    const n = parseFloat(raw);
    const clamped = Number.isFinite(n)
        ? Math.min(MAX_LOOP_DURATION, Math.max(MIN_LOOP_DURATION, n))
        : DEFAULT_LOOP_DURATION;

    return createDurationSeconds(clamped);
}

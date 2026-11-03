import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import type { Compiled } from '@repo/randomart-vm/codegen/types';
import type { ColorSpaceId } from '@repo/randomart-vm/color/registry';
import { MAX_WEIGHT } from '@repo/randomart-vm/grammar/constants';
import { createGrammar } from '@repo/randomart-vm/grammar/grammar';
import { drawGrammar as drawRandomGrammar } from '@repo/randomart-vm/grammar/quantized';
import { grammarRegistry } from '@repo/randomart-vm/grammar/registry';
import type { Grammar, SizeProfile } from '@repo/randomart-vm/grammar/types';
import type { Expression } from '@repo/randomart-vm/ir/types';
import { createRng } from '@repo/randomart-vm/rng/rng';
import { createSeed, randomSeed } from '@repo/randomart-vm/rng/seed';
import type { Seed } from '@repo/randomart-vm/rng/types';
import { vm } from '@repo/randomart-vm/vm/vm';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';

export const DEFAULT_LOOP_DURATION = createDurationSeconds(60);
export const MIN_LOOP_DURATION = 0.5;
export const MAX_LOOP_DURATION = 90;
export const HISTORY_LIMIT = 30;

export interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
    readonly expression?: Expression;
}

export interface VmState {
    // Clock & playback
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    actionError: string | null;
    duration: DurationSeconds;

    // Current artwork
    grammar: Grammar;
    seed: Seed;
    expression: Expression;
    compiledShader: Compiled;
    canvas: HTMLCanvasElement | null;

    // History
    history: readonly HistoryEntry[];
    currentId: number;
    nextEntryId: number;
    grammarEditId: number | null;
}

const initialSeed = createSeed(42);
const initialGrammar = grammarRegistry.default;
const initialExpression = vm.generate(initialGrammar, initialSeed);
const initialCompiled = vm.compile(initialExpression, { space: initialGrammar.space });
const initialEntry: HistoryEntry = {
    id: 0,
    seed: initialSeed,
    grammar: initialGrammar,
    nodes: initialCompiled.stats.nodes,
};

const nullClockStore = createNullClockStore();

const store = create<VmState>(() => ({
    clockStore: nullClockStore,
    shaderError: null,
    actionError: null,
    duration: DEFAULT_LOOP_DURATION,
    grammar: initialGrammar,
    seed: initialSeed,
    expression: initialExpression,
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

export function setActionError(error: unknown): void {
    store.setState({ actionError: error instanceof Error ? error.message : String(error) });
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

export function useCompiledShader(): Compiled {
    return store((s) => s.compiledShader);
}

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

/** Fixed maximum weight for all weight sliders (0..MAX_WEIGHT). */
export function useMaxWeight(): number {
    return MAX_WEIGHT;
}

export function useHistory(): readonly HistoryEntry[] {
    return store((s) => s.history);
}

export function useCurrentId(): number {
    return store((s) => s.currentId);
}

export function getVmState(): VmState {
    return store.getState();
}

interface CommitOptions {
    restoreId?: number;
    coalesce?: boolean;
}

/**
 * Frame-throttled commit: rapid slider ticks coalesce into a single generate+compile per rAF frame
 * instead of running the CPU+GPU work on every tick. Only the last queued commit runs.
 */
let commitFrame: number | null = null;
let commitQueued: {
    grammarOrChange: Grammar | (() => Grammar);
    seed: Seed;
    opts: CommitOptions;
} | null = null;

function runCommit(
    grammarOrChange: Grammar | (() => Grammar),
    seed: Seed,
    opts: CommitOptions,
): void {
    const { restoreId, coalesce = false } = opts;

    const grammar = typeof grammarOrChange === 'function' ? grammarOrChange() : grammarOrChange;
    const expression = vm.generate(grammar, seed);
    const compiledShader = vm.compile(expression, { space: grammar.space });

    if (restoreId === undefined) {
        const entry: HistoryEntry = {
            id: store.getState().nextEntryId,
            seed,
            grammar,
            expression,
            nodes: compiledShader.stats.nodes,
        };

        const state = store.getState();
        const replaces = coalesce && state.grammarEditId === state.currentId;

        const kept = replaces
            ? state.history.filter((candidate) => candidate.id !== state.currentId)
            : state.history;

        store.setState({
            history: [entry, ...kept].slice(0, HISTORY_LIMIT),
            currentId: entry.id,
            nextEntryId: state.nextEntryId + 1,
            grammarEditId: coalesce ? entry.id : null,
            grammar,
            seed,
            expression,
            compiledShader,
            actionError: null,
        });
    } else {
        store.setState({
            grammarEditId: null,
            currentId: restoreId,
            grammar,
            seed,
            expression,
            compiledShader,
            actionError: null,
        });
    }
}

function commit(
    grammarOrChange: Grammar | (() => Grammar),
    seed: Seed,
    opts: CommitOptions = {},
): void {
    commitQueued = { grammarOrChange, seed, opts };
    if (commitFrame === null) {
        commitFrame = requestAnimationFrame(() => {
            commitFrame = null;
            const queued = commitQueued;
            commitQueued = null;
            if (!queued) {
                return;
            }
            try {
                runCommit(queued.grammarOrChange, queued.seed, queued.opts);
            } catch (error) {
                setActionError(error);
            }
        });
    }
}

export function resetSeed(nextSeed: Seed = randomSeed()): void {
    commit(store.getState().grammar, nextSeed);
}

export function drawGrammar(pins: Parameters<typeof drawRandomGrammar>[1] = {}): void {
    commit(drawRandomGrammar(createRng(randomSeed()), pins), store.getState().seed);
}

export function generateImage(): void {
    commit(drawRandomGrammar(createRng(randomSeed())), randomSeed());
}

export function applyGrammar(grammar: Grammar): void {
    commit(grammar, store.getState().seed);
}

function editGrammar(change: (grammar: Grammar) => Grammar): void {
    const { grammar, seed } = store.getState();
    commit(() => change(grammar), seed, { coalesce: true });
}

export function setGrammarWeight(name: string, weight: number): void {
    editGrammar((grammar) =>
        createGrammar(vm.catalog, {
            ...grammar,
            weights: { ...grammar.weights, [name]: weight },
        }),
    );
}

export function setGrammarSize(size: SizeProfile): void {
    editGrammar((grammar) => createGrammar(vm.catalog, { ...grammar, size }));
}

export function setGrammarShareDepth(shareDepth: number): void {
    editGrammar((grammar) => createGrammar(vm.catalog, { ...grammar, shareDepth }));
}

export function setGrammarSpace(space: ColorSpaceId): void {
    editGrammar((grammar) => createGrammar(vm.catalog, { ...grammar, space }));
}

export function restoreEntry(id: number): void {
    const entry = store.getState().history.find((candidate) => candidate.id === id);
    if (!entry) {
        return;
    }
    // Replay the stored expression when available (skip generate+compile); otherwise regenerate.
    if (entry.expression) {
        const compiledShader = vm.compile(entry.expression, { space: entry.grammar.space });
        store.setState({
            grammar: entry.grammar,
            seed: entry.seed,
            expression: entry.expression,
            compiledShader,
            currentId: entry.id,
            grammarEditId: null,
            actionError: null,
        });
        return;
    }
    commit(entry.grammar, entry.seed, { restoreId: entry.id });
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

    downloadBlob(blob, `randomart-vm-${Date.now()}.png`);
}

export function parseDurationInput(raw: string): DurationSeconds {
    const n = parseFloat(raw);
    const clamped = Number.isFinite(n)
        ? Math.min(MAX_LOOP_DURATION, Math.max(MIN_LOOP_DURATION, n))
        : 4;

    return createDurationSeconds(clamped);
}

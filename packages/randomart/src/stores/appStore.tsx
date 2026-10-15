import { createDurationSeconds, type DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { createDefaultCatalog } from '../core/catalog/index.ts';
import { compile, type CompiledShader } from '../core/compiler/index.ts';
import type { Expression } from '../core/expression/index.ts';
import { generate } from '../core/generator/index.ts';
import { animatedGrammar, staticGrammar } from '../core/grammar/index.ts';
import { createSeed, randomSeed, type Seed } from '../core/random/index.ts';
import { DEFAULT_LOOP_DURATION } from '../renderer/contract';

type Theme = 'light' | 'dark' | 'system';
export type GrammarMode = 'static' | 'animated';

const catalog = createDefaultCatalog();

function buildGrammar(mode: GrammarMode) {
    return mode === 'animated' ? animatedGrammar(catalog) : staticGrammar(catalog);
}

const initialMode: GrammarMode = 'animated';
const initialGrammar = buildGrammar(initialMode);
const initialSeed = createSeed(42);
const initialExpression = generate(catalog, initialGrammar, initialSeed);
const initialCompiled = compile(catalog, initialExpression);

interface AppStoreState {
    theme: Theme;
    grammarMode: GrammarMode;
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    duration: DurationSeconds;
    seed: Seed;
    expression: Expression;
    compiledShader: CompiledShader;
    fragmentShader: string;
    canvas: HTMLCanvasElement | null;
}

const nullClockStore = createNullClockStore();

const store = create<AppStoreState>(() => ({
    theme: 'dark',
    grammarMode: initialMode,
    clockStore: nullClockStore,
    shaderError: null,
    duration: DEFAULT_LOOP_DURATION,
    seed: initialSeed,
    expression: initialExpression,
    compiledShader: initialCompiled,
    fragmentShader: initialCompiled.source,
    canvas: null,
}));

export function useTheme(): Theme {
    return store((s) => s.theme);
}

export function setTheme(theme: Theme): void {
    store.setState({ theme });
}

export function useGrammarMode(): GrammarMode {
    return store((s) => s.grammarMode);
}

export function setGrammarMode(grammarMode: GrammarMode): void {
    store.setState({ grammarMode });
    // Même seed : la bascule est réversible et l'image change tout de suite.
    regenerate(store.getState().seed);
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

export function regenerate(nextSeed: Seed = randomSeed()): void {
    const { grammarMode } = store.getState();
    const grammar = buildGrammar(grammarMode);
    const expression = generate(catalog, grammar, nextSeed);
    const compiledShader = compile(catalog, expression);
    store.setState({
        seed: nextSeed,
        expression,
        compiledShader,
        fragmentShader: compiledShader.source,
    });
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

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `randomart-${Date.now()}.png`;
    a.click();
    // Le téléchargement démarre après le retour de click() : on diffère la révocation.
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/** Parses a raw string into a valid DurationSeconds (clamps to [1, 60]). */
export function parseDurationInput(raw: string): DurationSeconds {
    const n = parseFloat(raw);
    const clamped = Number.isFinite(n) ? Math.min(60, Math.max(1, n)) : 8;
    return createDurationSeconds(clamped);
}

import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { createDefaultCatalog } from '../core/catalog/index.ts';
import { compile, type CompiledShader } from '../core/compiler/index.ts';
import type { Expression } from '../core/expression/index.ts';
import { generate } from '../core/generator/index.ts';
import { staticGrammar } from '../core/grammar/index.ts';
import { createSeed, randomSeed, type Seed } from '../core/random/index.ts';
import { DEFAULT_LOOP_DURATION } from '../renderer/contract';

type Theme = 'light' | 'dark' | 'system';

const catalog = createDefaultCatalog();
const grammar = staticGrammar(catalog);

const initialSeed = createSeed(42);
const initialExpression = generate(catalog, grammar, initialSeed);
const initialCompiled = compile(catalog, initialExpression);

interface AppStoreState {
    theme: Theme;
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    duration: DurationSeconds;
    seed: Seed;
    expression: Expression;
    compiledShader: CompiledShader;
    fragmentShader: string;
}

const nullClockStore = createNullClockStore();

const store = create<AppStoreState>(() => ({
    theme: 'dark',
    clockStore: nullClockStore,
    shaderError: null,
    duration: DEFAULT_LOOP_DURATION,
    seed: initialSeed,
    expression: initialExpression,
    compiledShader: initialCompiled,
    fragmentShader: initialCompiled.source,
}));

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

export function useDuration(): DurationSeconds {
    return store((s) => s.duration);
}

export function setDuration(duration: DurationSeconds): void {
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

export function regenerate(nextSeed: Seed = randomSeed()): void {
    const expression = generate(catalog, grammar, nextSeed);
    const compiledShader = compile(catalog, expression);
    store.setState({
        seed: nextSeed,
        expression,
        compiledShader,
        fragmentShader: compiledShader.source,
    });
}

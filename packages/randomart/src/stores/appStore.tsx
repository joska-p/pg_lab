import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { DEFAULT_LOOP_DURATION, HANDWRITTEN_TEST_SHADER } from '../renderer/contract';

type Theme = 'light' | 'dark' | 'system';

interface AppStoreState {
    theme: Theme;
    clockStore: ClockStore;
    shaderError: ShaderError | null;
    duration: DurationSeconds;
    fragmentShader: string;
}

const nullClockStore = createNullClockStore();

const store = create<AppStoreState>(() => ({
    theme: 'dark',
    clockStore: nullClockStore,
    shaderError: null,
    duration: DEFAULT_LOOP_DURATION,
    fragmentShader: HANDWRITTEN_TEST_SHADER,
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

export function useFragmentShader(): string {
    return store((s) => s.fragmentShader);
}

export function setFragmentShader(fragmentShader: string): void {
    store.setState({ fragmentShader });
}

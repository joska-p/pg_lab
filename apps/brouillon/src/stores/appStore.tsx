import { create } from 'zustand';

import type { RegistryKey } from '../experiments/stylex/demos/registry';

export type Theme = 'light' | 'dark' | 'system';

interface appStore {
    registryKey: RegistryKey;
    theme: Theme;
}

const appStore = create<appStore>(() => ({
    registryKey: 'button',
    theme: 'system',
}));

export function useTheme(): Theme {
    return appStore((s) => s.theme);
}

export function useRegistryKey(): RegistryKey {
    return appStore((s) => s.registryKey);
}

export function setTheme(theme: Theme): void {
    appStore.setState({ theme });
}

export function setRegistryKey(registryKey: RegistryKey): void {
    appStore.setState({ registryKey });
}

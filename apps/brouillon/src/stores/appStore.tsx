import { create } from 'zustand';

import type { ComponentName } from '../experiments/stylex/demos/registry';

export type Theme = 'light' | 'dark' | 'system';

interface appStore {
    componentName: ComponentName;
    theme: Theme;
}

const appStore = create<appStore>(() => ({
    componentName: 'button',
    theme: 'system',
}));

export function useTheme(): Theme {
    return appStore((s) => s.theme);
}

export function useComponentName(): ComponentName {
    return appStore((s) => s.componentName);
}

export function setTheme(theme: Theme): void {
    appStore.setState({ theme });
}

export function setComponentName(componentName: ComponentName): void {
    appStore.setState({ componentName });
}

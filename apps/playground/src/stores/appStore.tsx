import { create } from 'zustand';

import type { ExperimentKey } from '../experiments';

type theme = 'light' | 'dark';

interface appStore {
    theme: theme;
    experimentKey: ExperimentKey;
}

const appStore = create<appStore>(() => ({
    theme: 'dark',
    experimentKey: 'home',
}));

export function useTheme(): theme {
    return appStore((s) => s.theme);
}

export function useExperimentKey(): ExperimentKey {
    return appStore((s) => s.experimentKey);
}

export function setTheme(theme: theme): void {
    appStore.setState({ theme });
}

export function setExperimentKey(experimentKey: ExperimentKey): void {
    appStore.setState({ experimentKey });
}

import { create } from 'zustand';

import type { ExperimentKey } from '../experiments';

interface appStore {
    experimentKey: ExperimentKey;
}

const appStore = create<appStore>(() => ({
    experimentKey: 'home',
}));

export function useExperimentKey(): ExperimentKey {
    return appStore((s) => s.experimentKey);
}

export function setExperimentKey(experimentKey: ExperimentKey): void {
    appStore.setState({ experimentKey });
}

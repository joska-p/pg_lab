import { create } from 'zustand';

import type { ExperimentKey } from '../experiments';

const DEFAULT_EXPERIMENT: ExperimentKey = 'mandelbrot-naive';

interface AppStore {
    experimentKey: ExperimentKey;
}

const appStore = create<AppStore>(() => ({
    experimentKey: DEFAULT_EXPERIMENT,
}));

export function useExperimentKey(): ExperimentKey {
    return appStore((s) => s.experimentKey);
}

export function setExperimentKey(experimentKey: ExperimentKey): void {
    appStore.setState({ experimentKey });
}

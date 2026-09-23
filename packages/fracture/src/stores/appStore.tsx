import { create } from 'zustand';

import { EXPERIMENTS } from '../experiments';
import type { ExperimentKey } from '../experiments';

const DEFAULT_EXPERIMENT = (Object.keys(EXPERIMENTS) as ExperimentKey[])[0];

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

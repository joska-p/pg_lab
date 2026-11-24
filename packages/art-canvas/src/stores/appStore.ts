import { create } from 'zustand';

import type { ExperimentKey } from '../experiments';

interface AppStore {
    experimentKey: ExperimentKey;
}

const appStore = create<AppStore>(() => ({
    experimentKey: 'draw',
}));

export function useExperimentKey() {
    return appStore((state) => state.experimentKey);
}

export function setExperimentKey(experimentKey: ExperimentKey) {
    appStore.setState({ experimentKey });
}

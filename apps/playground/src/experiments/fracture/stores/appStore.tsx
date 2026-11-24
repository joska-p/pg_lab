import { create } from 'zustand';

import type { ExperimentId } from '../experiments';

const DEFAULT_EXPERIMENT: ExperimentId = 'mandelbrot-naive';

interface AppStore {
    experimentId: ExperimentId;
}

const appStore = create<AppStore>(() => ({
    experimentId: DEFAULT_EXPERIMENT,
}));

export function useExperimentId(): ExperimentId {
    return appStore((s) => s.experimentId);
}

export function setExperimentId(experimentId: ExperimentId): void {
    appStore.setState({ experimentId });
}

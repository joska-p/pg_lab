import { create } from 'zustand';

import { DEFAULT_EXPERIMENT, getExperiment } from '../experiments';
import type { ExperimentDefinition, ExperimentId } from '../experiments';

interface AppStore {
    experimentId: ExperimentId;
}

const appStore = create<AppStore>(() => ({
    experimentId: DEFAULT_EXPERIMENT.id,
}));

// Store read seam: consumers always receive a definition, never an absent
// lookup. The default is explicit here rather than hidden in the registry.
export function useExperiment(): ExperimentDefinition {
    const experimentId = appStore((s) => s.experimentId);
    return getExperiment(experimentId) ?? DEFAULT_EXPERIMENT;
}

export function setExperimentId(experimentId: ExperimentId): void {
    appStore.setState({ experimentId });
}

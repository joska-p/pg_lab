import { create } from 'zustand';

import { EXPERIMENTS, type ExperimentId } from '../experiments';

const DEFAULT_EXPERIMENT = (Object.keys(EXPERIMENTS) as ExperimentId[])[0];

interface WorkshopState {
    activeExperiment: ExperimentId;
}

const workshopStore = create<WorkshopState>(() => ({
    activeExperiment: DEFAULT_EXPERIMENT,
}));

export function useActiveExperiment(): ExperimentId {
    return workshopStore((s) => s.activeExperiment);
}

export function setActiveExperiment(experiment: ExperimentId): void {
    workshopStore.setState({ activeExperiment: experiment });
}

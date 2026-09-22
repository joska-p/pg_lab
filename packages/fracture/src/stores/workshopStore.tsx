import { create } from 'zustand';

import type { ExperimentId } from '../experiments';

interface WorkshopState {
    activeExperiment: ExperimentId;
}

const workshopStore = create<WorkshopState>(() => ({
    activeExperiment: 'mandelbrot',
}));

export function useActiveExperiment(): ExperimentId {
    return workshopStore((s) => s.activeExperiment);
}

export function setActiveExperiment(experiment: ExperimentId): void {
    workshopStore.setState({ activeExperiment: experiment });
}

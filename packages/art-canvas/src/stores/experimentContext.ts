import { createContext } from 'react';

import type { ExperimentDefinition, ExperimentId } from '../experiments';

export interface ExperimentContextValue {
    experiment: ExperimentDefinition;
    setExperimentId: (experimentId: ExperimentId) => void;
}

export const ExperimentContext = createContext<ExperimentContextValue | null>(null);

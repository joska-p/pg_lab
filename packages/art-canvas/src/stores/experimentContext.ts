import { createContext } from 'react';

import type { ExperimentId } from '../experiments';

export interface ExperimentContextValue {
    experimentId: ExperimentId;
    setExperimentId: (experimentId: ExperimentId) => void;
}

export const ExperimentContext = createContext<ExperimentContextValue | null>(null);

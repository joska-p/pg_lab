import { useContext } from 'react';

import type { ExperimentDefinition, ExperimentId } from '../experiments';
import type { ExperimentContextValue } from './experimentContext';
import { ExperimentContext } from './experimentContext';

function useExperimentContext(): ExperimentContextValue {
    const context = useContext(ExperimentContext);
    if (!context) {
        throw new Error(
            "useExperiment et useSetExperimentId doivent être utilisés à l'intérieur d'un <ExperimentProvider>",
        );
    }
    return context;
}

export function useExperiment(): ExperimentDefinition {
    return useExperimentContext().experiment;
}

export function useSetExperimentId(): (experimentId: ExperimentId) => void {
    return useExperimentContext().setExperimentId;
}

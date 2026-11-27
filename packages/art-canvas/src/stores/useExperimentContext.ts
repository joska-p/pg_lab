import { useContext } from 'react';

import type { ExperimentContextValue } from './experimentContext';
import { ExperimentContext } from './experimentContext';

export function useExperimentContext(): ExperimentContextValue {
    const context = useContext(ExperimentContext);
    if (!context) {
        throw new Error(
            "useExperiment et useSetExperimentId doivent être utilisés à l'intérieur d'un <ExperimentProvider>",
        );
    }
    return context;
}

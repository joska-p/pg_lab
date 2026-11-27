import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { DEFAULT_EXPERIMENT, getExperiment } from '../experiments';
import type { ExperimentId } from '../experiments';
import type { ExperimentContextValue } from './experimentContext';
import { ExperimentContext } from './experimentContext';

interface ExperimentProviderProps {
    children: ReactNode;
    initialExperimentId?: ExperimentId;
}

export function ExperimentProvider({
    children,
    initialExperimentId = DEFAULT_EXPERIMENT.id,
}: ExperimentProviderProps) {
    const [experimentId, setExperimentIdState] = useState<ExperimentId>(initialExperimentId);

    const setExperimentId = useCallback((id: ExperimentId) => {
        setExperimentIdState(id);
    }, []);

    const value = useMemo<ExperimentContextValue>(
        () => ({
            experiment: getExperiment(experimentId) ?? DEFAULT_EXPERIMENT,
            setExperimentId,
        }),
        [experimentId, setExperimentId],
    );

    return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}

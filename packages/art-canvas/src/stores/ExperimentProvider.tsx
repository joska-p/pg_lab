import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { DEFAULT_EXPERIMENT } from '../experiments';
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
    const [experimentId, setExperimentId] = useState<ExperimentId>(initialExperimentId);

    const value = useMemo<ExperimentContextValue>(
        () => ({
            experimentId,
            setExperimentId,
        }),
        [experimentId, setExperimentId],
    );

    return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}

import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { experimentOptions, getExperiment } from '../experiments';
import type { ExperimentId } from '../experiments';
import { useExperimentContext } from '../stores/useExperimentContext';

export function Controls() {
    const { experimentId, setExperimentId } = useExperimentContext();
    const experiment = getExperiment(experimentId);
    const ActiveControls = experiment?.Controls;

    return (
        <ControlPanel
            action={
                <Select<ExperimentId>
                    value={experimentId}
                    onValueChange={setExperimentId}
                    options={experimentOptions}
                />
            }
        >
            {ActiveControls && (
                <ControlSection>
                    <Suspense fallback={null}>
                        <ActiveControls />
                    </Suspense>
                </ControlSection>
            )}
        </ControlPanel>
    );
}

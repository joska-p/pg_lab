import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Suspense } from 'react';

import { experimentOptions, getExperiment } from '../experiments';
import { setExperimentId, useExperimentId } from '../stores/appStore';
import { PerfHud } from './PerfHud';

export function Controls() {
    const experimentKey = useExperimentId();
    const { Controls, label } = getExperiment(experimentKey);

    return (
        <>
            <ControlSection title="Experiment">
                <Segmented
                    options={experimentOptions}
                    value={experimentKey}
                    onValueChange={setExperimentId}
                />
            </ControlSection>

            {Controls && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <Controls />
                    </Suspense>
                </ControlSection>
            )}
            <ControlSection title="Perf">
                <PerfHud />
            </ControlSection>
        </>
    );
}

import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { experimentOptions } from '../experiments';
import type { ExperimentId } from '../experiments';
import { useSetExperimentId, useExperiment } from '../stores/useExperimentContext';

export function Controls() {
    const { Controls: ActiveControls, id } = useExperiment();

    return (
        <ControlPanel
            action={
                <Select<ExperimentId>
                    value={id}
                    onValueChange={useSetExperimentId}
                    options={experimentOptions}
                />
            }
        >
            {ActiveControls != null && (
                <ControlSection>
                    <Suspense fallback={null}>
                        <ActiveControls />
                    </Suspense>
                </ControlSection>
            )}
        </ControlPanel>
    );
}

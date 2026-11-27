import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { experimentOptions } from '../experiments';
import type { ExperimentId } from '../experiments';
import { setExperimentId, useExperiment } from '../stores/appStore';

export function Controls() {
    const { Controls: ActiveControls, label, id } = useExperiment();

    return (
        <ControlPanel title="Art Canvas">
            <Select<ExperimentId>
                label="Experiment"
                value={id}
                onValueChange={setExperimentId}
                options={experimentOptions}
            />
            {ActiveControls != null && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <ActiveControls />
                    </Suspense>
                </ControlSection>
            )}
        </ControlPanel>
    );
}

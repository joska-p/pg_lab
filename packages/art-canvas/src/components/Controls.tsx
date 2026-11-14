import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { experimentOptions, getExperiment } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';

export function Controls() {
    const experimentKey = useExperimentKey();
    const { Controls, label } = getExperiment(experimentKey);

    return (
        <ControlPanel>
            <Select<ExperimentKey>
                label="Experiment"
                value={experimentKey}
                onValueChange={setExperimentKey}
                options={experimentOptions}
            />
            {Controls != null && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <Controls />
                    </Suspense>
                </ControlSection>
            )}
        </ControlPanel>
    );
}

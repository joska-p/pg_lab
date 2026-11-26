import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { DEFAULT_EXPERIMENT, experimentOptions, getExperiment } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';

export function Controls() {
    const experimentKey = useExperimentKey();
    const { Controls: ActiveControls, label } = getExperiment(experimentKey) ?? DEFAULT_EXPERIMENT;

    return (
        <ControlPanel>
            <Select<ExperimentKey>
                label="Experiment"
                value={experimentKey}
                onValueChange={setExperimentKey}
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

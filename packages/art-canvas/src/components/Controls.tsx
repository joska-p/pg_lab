import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { EXPERIMENTS, experimentKeys } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';

const OPTIONS = experimentKeys.map((value) => ({
    value,
    label: EXPERIMENTS[value].label,
}));

export function Controls() {
    const experimentKey = useExperimentKey();
    const { Controls, label } = EXPERIMENTS[experimentKey];

    return (
        <ControlPanel>
            <Select<ExperimentKey>
                label="Experiment"
                value={experimentKey}
                onValueChange={setExperimentKey}
                options={OPTIONS}
            />
            {Controls && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <Controls />
                    </Suspense>
                </ControlSection>
            )}
        </ControlPanel>
    );
}

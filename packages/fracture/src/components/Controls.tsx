import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Suspense } from 'react';

import { EXPERIMENTS, experimentKeys } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';
import { PerfHud } from './PerfHud';

const OPTIONS = experimentKeys.map((id) => ({
    value: id,
    label: EXPERIMENTS[id].label,
}));

export function Controls() {
    const experimentKey = useExperimentKey();
    const { Controls, label } = EXPERIMENTS[experimentKey];

    return (
        <>
            <ControlSection title="Experiment">
                <Segmented<ExperimentKey>
                    options={OPTIONS}
                    value={experimentKey}
                    onValueChange={setExperimentKey}
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

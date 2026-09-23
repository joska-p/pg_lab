import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Suspense } from 'react';

import { EXPERIMENTS } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';
import { PerfHud } from './PerfHud';

const OPTIONS = (Object.keys(EXPERIMENTS) as ExperimentKey[]).map((id) => ({
    value: id,
    label: EXPERIMENTS[id].label,
}));

export function Controls() {
    const experimentKey = useExperimentKey();
    const { Controls, label } = EXPERIMENTS[experimentKey];

    return (
        <>
            <ControlSection title="Experiment">
                <Segmented
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

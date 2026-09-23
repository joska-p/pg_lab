import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { EXPERIMENTS } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';

const OPTIONS = Object.entries(EXPERIMENTS).map(([value, { label }]) => ({
    value: value as ExperimentKey,
    label,
}));

export function Controls() {
    const experimentKey = useExperimentKey();
    const { Controls, label } = EXPERIMENTS[experimentKey];

    return (
        <>
            <Select
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
        </>
    );
}

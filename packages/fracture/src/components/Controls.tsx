import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Suspense } from 'react';

import { experimentOptions } from '../experiments';
import { setExperimentId, useExperiment } from '../stores/appStore';
import { PerfHud } from './PerfHud';

export function Controls() {
    const { Controls: ActiveControls, label, id } = useExperiment();

    return (
        <ControlPanel>
            <ControlSection title="Experiment">
                <Segmented options={experimentOptions} value={id} onValueChange={setExperimentId} />
            </ControlSection>

            {ActiveControls && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <ActiveControls />
                    </Suspense>
                </ControlSection>
            )}
            <ControlSection title="Perf">
                <PerfHud />
            </ControlSection>
        </ControlPanel>
    );
}

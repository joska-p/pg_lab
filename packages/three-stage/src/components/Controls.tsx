import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { Select } from '@repo/ui/components/Select';

import { experimentOptions } from '../experiments';
import type { ExperimentId } from '../experiments';
import { setExperimentId, useExperiment } from '../stores/appStore';

export function Controls() {
    const { id } = useExperiment();

    return (
        <ControlPanel title="three-stage">
            <Select<ExperimentId>
                label="Experiment"
                value={id}
                onValueChange={setExperimentId}
                options={experimentOptions}
            />
        </ControlPanel>
    );
}

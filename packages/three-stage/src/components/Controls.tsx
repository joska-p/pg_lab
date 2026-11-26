import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { Select } from '@repo/ui/components/Select';

import { experimentOptions } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';

export function Controls() {
    const experimentKey = useExperimentKey();

    return (
        <ControlPanel>
            <Select<ExperimentKey>
                label="Experiment"
                value={experimentKey}
                onValueChange={setExperimentKey}
                options={experimentOptions}
            />
        </ControlPanel>
    );
}

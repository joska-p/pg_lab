import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { Select } from '@repo/ui/components/Select';

import { experimentOptions } from '../experiments';
import type { ExperimentDefinition, ExperimentId } from '../experiments';

interface ControlsProps {
    readonly experiment: ExperimentDefinition;
    readonly onExperimentIdChange: (experimentId: ExperimentId) => void;
}

export function Controls({ experiment, onExperimentIdChange }: ControlsProps) {
    return (
        <ControlPanel
            action={
                <Select<ExperimentId>
                    value={experiment.id}
                    onValueChange={onExperimentIdChange}
                    options={experimentOptions}
                />
            }
        ></ControlPanel>
    );
}

import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { experimentOptions } from '../experiments';
import type { ExperimentDefinition, ExperimentId } from '../experiments';
import { PerfHud } from './PerfHud';

interface ControlsProps {
    readonly experiment: ExperimentDefinition;
    readonly onExperimentIdChange: (experimentId: ExperimentId) => void;
}

export function Controls({ experiment, onExperimentIdChange }: ControlsProps) {
    const ActiveControls = experiment.Controls;

    return (
        <ControlPanel
            action={
                <Select<ExperimentId>
                    value={experiment.id}
                    onValueChange={onExperimentIdChange}
                    options={experimentOptions}
                />
            }
        >
            {ActiveControls && (
                <ControlSection>
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

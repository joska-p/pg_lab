import { ControlPanel as UiControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Readout } from '@repo/ui/components/Readout';

import { useGeneration } from '../../stores/automa/selectors';
import { CreatureSection } from './CreatureSection';
import { EditSection } from './EditSection';
import { PlaybackSection } from './PlaybackSection';
import { RuleSection } from './RuleSection';

export function ControlPanel() {
    const generation = useGeneration();

    return (
        <UiControlPanel title="automa controls">
            <ControlSection title="Simulation">
                <Readout label="Generation" value={generation} />
            </ControlSection>
            <PlaybackSection />
            <EditSection />
            <RuleSection />
            <CreatureSection />
        </UiControlPanel>
    );
}

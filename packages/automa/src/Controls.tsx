import { ControlSection } from '@repo/ui/components/ControlSection';
import { Readout } from '@repo/ui/components/Readout';

import { CreatureSection } from './components/controls/CreatureSection';
import { EditSection } from './components/controls/EditSection';
import { PlaybackSection } from './components/controls/PlaybackSection';
import { RuleSection } from './components/controls/RuleSection';
import { useGeneration } from './stores/automa/selectors';

export function Controls() {
    const generation = useGeneration();

    return (
        <>
            <ControlSection title="Simulation">
                <Readout label="Generation" value={generation} />
            </ControlSection>
            <PlaybackSection />
            <EditSection />
            <RuleSection />
            <CreatureSection />
        </>
    );
}

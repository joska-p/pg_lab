import { ControlPanel as UiControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Readout } from '@repo/ui/components/Readout';
import { Segmented } from '@repo/ui/components/Segmented';

import { setTheme, useTheme } from '../../stores/appStore';
import { useGeneration } from '../../stores/automa/selectors';
import { PlaybackSection } from './PlaybackSection';

export function ControlPanel() {
    const theme = useTheme();
    const generation = useGeneration();

    return (
        <UiControlPanel title="automa controls">
            <ControlSection title="Simulation">
                <Readout label="Generation" value={generation} />
            </ControlSection>
            <PlaybackSection />
            <ControlSection title="Theme">
                <Segmented<'light' | 'dark' | 'system'>
                    options={['light', 'dark', 'system']}
                    value={theme}
                    onValueChange={setTheme}
                />
            </ControlSection>
        </UiControlPanel>
    );
}

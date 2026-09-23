import { ControlPanel as UiControlPanel } from '@repo/ui/components/ControlPanel';

import { Controls } from '../../Controls';

export function ControlPanel() {
    return (
        <UiControlPanel title="automa controls">
            <Controls />
        </UiControlPanel>
    );
}

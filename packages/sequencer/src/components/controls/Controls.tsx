import { ControlPanel } from '@repo/ui/components/ControlPanel';

import { register } from '../../modules/fourier';
import { LayerStackEditor } from '../layers/LayerStackEditor';
import { SequenceSection } from './SequenceSection';
import { ViewportSection } from './ViewportSection';

register();

export function Controls() {
    return (
        <ControlPanel title="Sequencer">
            <SequenceSection />
            <ViewportSection />
            <LayerStackEditor />
        </ControlPanel>
    );
}

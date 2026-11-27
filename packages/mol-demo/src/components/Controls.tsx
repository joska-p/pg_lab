import { ControlPanel } from '@repo/ui/components/ControlPanel';

import { MoleculeList } from './MoleculeList';
import { PerfHud } from './PerfHud';

export function Controls() {
    return (
        <ControlPanel title="Mol Demo">
            <MoleculeList />
            <PerfHud />
        </ControlPanel>
    );
}

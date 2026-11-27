import { ControlPanel } from '@repo/ui/components/ControlPanel';

import { MoleculeList } from './MoleculeList';
import { PerfHud } from './PerfHud';

export function Controls() {
    return (
        <ControlPanel>
            <MoleculeList />
            <PerfHud />
        </ControlPanel>
    );
}

import { ControlSection } from '@repo/ui/components/ControlSection';
import { Readout } from '@repo/ui/components/Readout';
import { Segmented } from '@repo/ui/components/Segmented';
import { Text } from '@repo/ui/components/Text';
import { useEffect } from 'react';

import { MOLECULES } from '../lib/molecules';
import {
    selectMolecule,
    useMoleculeCurrent,
    useMoleculeError,
    useMoleculeFile,
    useMoleculeStatus,
} from '../stores/moleculeStore';

// Registry picker (UC A1): lists MOLECULES, loads the selected entry's
// data (fetch + parse + validate). Rendering the 3D view is S8's job;
// this component only exposes the loaded molecule + load errors.
export function MoleculeList() {
    const file = useMoleculeFile();
    const current = useMoleculeCurrent();
    const status = useMoleculeStatus();
    const error = useMoleculeError();

    useEffect(() => {
        if (status === 'idle') {
            void selectMolecule(file);
        }
    }, [status, file]);

    return (
        <ControlSection title="Molecule">
            <Segmented
                options={MOLECULES.map((e) => ({ value: e.file, label: `${e.name} · ${e.atoms}` }))}
                value={file}
                onValueChange={(next) => {
                    void selectMolecule(next);
                }}
            />
            <Readout
                label="Loaded"
                value={
                    status === 'ready' && current
                        ? `${current.name} · ${current.atoms.length} atoms · ${current.bonds.length} bonds`
                        : status
                }
            />
            {error && <Text variant="muted">{error}</Text>}
        </ControlSection>
    );
}

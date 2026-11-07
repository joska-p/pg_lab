import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';

import { Commands } from '../notes/captains-logs/commands';
import type { NoteSlug } from '../stores/appStore';
import { useSelectedNoteSlug, setSelectedNoteSlug } from '../stores/appStore';

const NOTE_OPTIONS = [
    { value: 'birth-of-complexity', label: 'birth of complexity' },
    { value: 'genese', label: 'généalogie' },
    { value: 'captains-logs', label: 'captains logs' },
] as const satisfies readonly { value: NoteSlug; label: string }[];

export function Controls() {
    const selectedNoteSlug = useSelectedNoteSlug();

    return (
        <ControlSection title="Folios & Chroniques">
            <Segmented<NoteSlug>
                color="orange"
                value={selectedNoteSlug}
                onValueChange={setSelectedNoteSlug}
                options={NOTE_OPTIONS}
            />
            {selectedNoteSlug === 'captains-logs' ? <Commands /> : null}
        </ControlSection>
    );
}

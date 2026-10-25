import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';

import type { NoteSlug } from '../stores/appStore';
import { useSelectedNoteSlug, setSelectedNoteSlug } from '../stores/appStore';

export function Controls() {
    const selectedNoteSlug = useSelectedNoteSlug();

    return (
        <ControlSection title="Folios & Chroniques">
            <Segmented
                color="orange"
                value={selectedNoteSlug}
                onValueChange={(val) => setSelectedNoteSlug(val as NoteSlug)}
                options={[
                    { value: 'birth-of-complexity', label: 'birth of complexity' },
                    { value: 'genese', label: 'généalogie' },
                    { value: 'captains-logs', label: 'captains logs' },
                ]}
            />
        </ControlSection>
    );
}

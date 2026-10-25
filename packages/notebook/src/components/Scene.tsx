import type { ComponentType } from 'react';

import { BirthOfComplexity } from '../notes/birth-of-complexity';
import { CaptainsLogs } from '../notes/captains-logs';
import { Genese } from '../notes/genese';
import type { NoteSlug } from '../stores/appStore';
import { useSelectedNoteSlug } from '../stores/appStore';

const NOTES: Record<NoteSlug, ComponentType> = {
    'birth-of-complexity': BirthOfComplexity,
    genese: Genese,
    'captains-logs': CaptainsLogs,
};

export function Scene() {
    const selectedNoteSlug = useSelectedNoteSlug();
    const Note = NOTES[selectedNoteSlug];

    return <Note />;
}

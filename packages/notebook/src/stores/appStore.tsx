import { create } from 'zustand';

export type NoteSlug = 'birth-of-complexity' | 'genese' | 'captains-logs';

interface appStore {
    selectedNoteSlug: NoteSlug;
}

const appStore = create<appStore>(() => ({
    selectedNoteSlug: 'birth-of-complexity',
}));

export function useSelectedNoteSlug(): NoteSlug {
    return appStore((s) => s.selectedNoteSlug);
}

export function setSelectedNoteSlug(noteSlug: NoteSlug): void {
    appStore.setState({ selectedNoteSlug: noteSlug });
}

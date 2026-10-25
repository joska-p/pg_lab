import { create } from 'zustand';

import { NOTES } from '../notes/registry';

type theme = 'light' | 'dark' | 'system';

type appStore = {
    theme: theme;
    selectedNoteSlug: string;
};

const initialSlug =
    (typeof window !== 'undefined' && window.location.hash.replace(/^#/, '')) ||
    NOTES[0]?.slug ||
    '';

const appStore = create<appStore>(() => ({
    theme: 'dark',
    selectedNoteSlug: initialSlug,
}));

export function useTheme(): theme {
    return appStore((s) => s.theme);
}

export function setTheme(theme: theme): void {
    appStore.setState({ theme });
}

export function useSelectedNoteSlug(): string {
    return appStore((s) => s.selectedNoteSlug);
}

export function setSelectedNoteSlug(slug: string): void {
    appStore.setState({ selectedNoteSlug: slug });
}

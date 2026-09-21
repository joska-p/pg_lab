import { create } from 'zustand';

type theme = 'light' | 'dark' | 'system';

interface appStore {
    theme: theme;
}

const appStore = create<appStore>(() => ({
    theme: 'dark',
}));

export function useTheme(): theme {
    return appStore((s) => s.theme);
}

export function setTheme(theme: theme): void {
    appStore.setState({ theme });
}

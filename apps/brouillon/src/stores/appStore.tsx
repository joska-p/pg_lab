import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface appStore {
    theme: Theme;
}

const appStore = create<appStore>(() => ({
    theme: 'system',
}));

export function useTheme(): Theme {
    return appStore((s) => s.theme);
}

export function setTheme(theme: Theme): void {
    appStore.setState({ theme });
}

import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface appStore {
    theme: Theme;
}

const appStore = create<appStore>(() => ({
    theme: 'dark',
}));

export function useTheme(): Theme {
    return appStore((s) => s.theme);
}

export function setTheme(theme: Theme): void {
    appStore.setState({ theme });
}

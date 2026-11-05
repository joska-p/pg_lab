import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

type AppState = {
    theme: Theme;
};

const appStore = create<AppState>(() => ({
    theme: 'dark',
}));

export function useTheme(): Theme {
    return appStore((s) => s.theme);
}

export function setTheme(theme: Theme): void {
    appStore.setState({ theme });
}

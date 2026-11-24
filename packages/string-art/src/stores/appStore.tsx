import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
    theme: Theme;
}

const appStore = create<AppState>(() => ({
    theme: 'dark',
}));

export function useTheme(): Theme {
    return appStore((state) => state.theme);
}

export function setTheme(theme: Theme): void {
    appStore.setState({ theme });
}

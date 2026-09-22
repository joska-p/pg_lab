import { create } from 'zustand';

type theme = 'light' | 'dark' | 'system';
export type PageName = 'menu' | 'art-canvas' | 'mosaic-maker' | 'mol-demo' | 'automa' | 'fracture';

interface appStore {
    theme: theme;
    pageName: PageName;
}

const appStore = create<appStore>(() => ({
    theme: 'dark',
    pageName: 'menu',
}));

export function useTheme(): theme {
    return appStore((s) => s.theme);
}

export function usePageName(): PageName {
    return appStore((s) => s.pageName);
}

export function setTheme(theme: theme): void {
    appStore.setState({ theme });
}

export function setPageName(pageName: PageName): void {
    appStore.setState({ pageName });
}

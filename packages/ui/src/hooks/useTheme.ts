import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

const THEMES: readonly Theme[] = ['system', 'light', 'dark'];

/** Turns a raw stored value into a `Theme`; anything unknown means "follow the system". */
export function parseTheme(value: string | null): Theme {
    return THEMES.find((theme) => theme === value) ?? 'system';
}

/**
 * `localStorage` can throw in private mode and is absent under SSR. Reading it must not take the
 * render down, so a failure simply means "no preference yet".
 */
export function readStoredTheme(): Theme {
    try {
        return parseTheme(localStorage.getItem('theme'));
    } catch {
        return 'system';
    }
}

function writeStoredTheme(theme: Theme): void {
    try {
        if (theme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }
    } catch {
        // Storage unavailable: keep the in-memory theme, it still applies for this session.
    }
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(readStoredTheme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'system') {
            delete root.dataset.theme;
        } else {
            root.dataset.theme = theme;
        }

        writeStoredTheme(theme);
    }, [theme]);

    return [theme, setTheme] as const;
}

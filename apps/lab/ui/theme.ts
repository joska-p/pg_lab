export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'pg-theme';

function isTheme(value: string | null | undefined): value is Theme {
    return value === 'light' || value === 'dark';
}

function loadTheme(): Theme | null {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);

        return isTheme(stored) ? stored : null;
    } catch {
        return null;
    }
}

function saveTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage can be unavailable in private browsing; the theme still applies in memory.
    }
}

function systemTheme(): Theme {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getTheme(): Theme {
    const current = document.documentElement.dataset.theme;

    return isTheme(current) ? current : systemTheme();
}

export function applyTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
    applyTheme(theme);
    saveTheme(theme);
}

export function toggleTheme(): void {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme(): void {
    applyTheme(loadTheme() ?? systemTheme());

    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
        button.addEventListener('click', toggleTheme);
    }
}

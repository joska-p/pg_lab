import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem('theme') as Theme) ?? 'system',
    );

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'system') {
            delete root.dataset.theme;
            localStorage.removeItem('theme');
        } else {
            root.dataset.theme = theme;
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    return [theme, setTheme] as const;
}

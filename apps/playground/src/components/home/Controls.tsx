import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { useTheme, type Theme } from '@repo/ui/hooks/useTheme';
import { useEffect } from 'react';

export function Controls() {
    const [theme, setTheme] = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'dark' ? 'light dark' : theme;
    }, [theme]);

    return (
        <>
            <ControlSection title="Theme">
                <Select
                    label="Theme"
                    value={theme}
                    onValueChange={(val) => setTheme(val as Theme)}
                    options={[
                        { value: 'system', label: 'System' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                    ]}
                />
            </ControlSection>
        </>
    );
}

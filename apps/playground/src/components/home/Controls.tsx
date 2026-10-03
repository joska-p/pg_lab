import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { backgrounds, type ShellBackground } from '@repo/ui/components/ShellWrapper';
import { useTheme, type Theme } from '@repo/ui/hooks/useTheme';

import { setShellBackground, useShellBackground } from '../../stores/appStore';

const shellBackgroundOptions: {
    value: ShellBackground;
    label: string;
}[] = Object.keys(backgrounds).map((value) => ({
    value: value as ShellBackground,
    label: value,
}));

export function Controls() {
    const [theme, setTheme] = useTheme();
    const shellBackground = useShellBackground();

    return (
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
            <Select
                label="Background"
                value={shellBackground}
                onValueChange={(val) => setShellBackground(val as ShellBackground)}
                options={shellBackgroundOptions}
            />
        </ControlSection>
    );
}

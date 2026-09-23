import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { useEffect } from 'react';

import { useTheme, setTheme } from '../../stores/appStore';

export function Controls() {
    const theme = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'dark' ? 'light dark' : theme;
    }, [theme]);

    return (
        <>
            <ControlSection title="Theme">
                <Segmented options={['light', 'dark']} value={theme} onValueChange={setTheme} />
            </ControlSection>
        </>
    );
}

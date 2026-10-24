import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';

import { setTheme, useTheme } from '../stores/appStore';

export function Controls() {
    const theme = useTheme();

    return (
        <ControlSection title="Theme">
            <Segmented<'light' | 'dark' | 'system'>
                options={['light', 'dark', 'system']}
                value={theme}
                onValueChange={setTheme}
            />
        </ControlSection>
    );
}

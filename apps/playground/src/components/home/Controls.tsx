import { Select } from '@repo/ui/components/Select';
import type { ShellBackground } from '@repo/ui/recipes/shellBackground';

import { setShellBackground, useShellBackground } from '../../stores/appStore';

export function Controls() {
    const shellBackground = useShellBackground();

    return (
        <Select<ShellBackground>
            label="Background"
            value={shellBackground}
            onValueChange={setShellBackground}
            options={[
                {
                    label: 'auroral-fluid',
                    value: 'auroral-fluid',
                },
                {
                    label: 'thermal-magma',
                    value: 'thermal-magma',
                },
                {
                    label: 'lava-flow',
                    value: 'lava-flow',
                },
            ]}
        />
    );
}

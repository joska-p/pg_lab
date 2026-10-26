import { Select } from '@repo/ui/components/Select';
import { shellBackground } from '@repo/ui/recipes/shellBackground';
import type { ShellBackground } from '@repo/ui/recipes/shellBackground';

import { setShellBackground, useShellBackground } from '../../stores/appStore';

const shellBackgroundOptions: {
    value: ShellBackground;
    label: string;
}[] = Object.keys(shellBackground).map((value) => ({
    value: value as ShellBackground,
    label: value,
}));

export function Controls() {
    const shellBackground = useShellBackground();

    return (
        <Select
            label="Background"
            value={shellBackground}
            onValueChange={(val: ShellBackground) => setShellBackground(val)}
            options={shellBackgroundOptions}
        />
    );
}

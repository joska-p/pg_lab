import { Select } from '@repo/ui/components/Select';
import { shellBackground } from '@repo/ui/recipes/shellBackground';
import type { ShellBackground } from '@repo/ui/recipes/shellBackground';

import { setShellBackground, useShellBackground } from '../../stores/appStore';
import { typedKeys } from '../../utils/object';

const shellBackgroundOptions: {
    value: ShellBackground;
    label: string;
}[] = typedKeys(shellBackground).map((value) => ({
    value,
    label: value,
}));

export function Controls() {
    const shellBackground = useShellBackground();

    return (
        <Select<ShellBackground>
            label="Background"
            value={shellBackground}
            onValueChange={setShellBackground}
            options={shellBackgroundOptions}
        />
    );
}

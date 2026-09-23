import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Suspense } from 'react';

import { EXPERIMENTS } from './modes';
import { setInputMode, useInputMode } from './stores/ui/store';
import type { InputMode } from './stores/ui/store';

const MODE_OPTIONS = Object.entries(EXPERIMENTS).map(([value, { label }]) => ({
    value: value as InputMode,
    label,
}));

export function Controls() {
    const mode = useInputMode();
    const { Controls: ModeControls, label } = EXPERIMENTS[mode];

    return (
        <>
            <Select<InputMode>
                label="Mode"
                value={mode}
                onValueChange={setInputMode}
                options={MODE_OPTIONS}
            />
            {ModeControls && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <ModeControls />
                    </Suspense>
                </ControlSection>
            )}
        </>
    );
}

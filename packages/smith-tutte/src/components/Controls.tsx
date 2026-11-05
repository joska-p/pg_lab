import { Button } from '@repo/ui/components/Button';
import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';

import {
    useClockStore,
    useNetlistKey,
    setNetlistKey,
    NETLIST_ENTRIES,
} from '../stores/experimentStore';
import type { NetlistKey } from '../stores/experimentStore';

export function Controls() {
    const netlistKey = useNetlistKey();
    const clockStore = useClockStore();
    const hasClock = clockStore !== null;
    const isPlaying = clockStore?.getIsPlaying() ?? false;

    return (
        <ControlPanel title="smith-tutte">
            <ControlSection title="Netlist">
                <Segmented<NetlistKey>
                    options={NETLIST_ENTRIES.map((e) => ({ value: e.key, label: e.label }))}
                    value={netlistKey}
                    onValueChange={setNetlistKey}
                />
            </ControlSection>

            <ControlSection title="Animation">
                <Stack direction="horizontal" gap="2">
                    <Button
                        title="play/pause the animation"
                        color="aurora"
                        onClick={() => clockStore?.togglePlay()}
                        disabled={!hasClock}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                        title="reset the animation clock"
                        onClick={() => clockStore?.reset()}
                        disabled={!hasClock}
                    >
                        Reset
                    </Button>
                </Stack>
            </ControlSection>
        </ControlPanel>
    );
}

import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Stack } from '@repo/ui/components/Stack';

import { restoreEntry, useCurrentId, useHistory } from '../../stores/appStore';

/** Walks back through past candidates. */
export function HistoryPanel() {
    const history = useHistory();
    const currentId = useCurrentId();

    return (
        <ControlField label="History">
            {history.length > 0 && (
                <Stack direction="horizontal" gap="2">
                    {history.map((entry) => (
                        <Button
                            key={entry.id}
                            color={entry.id === currentId ? 'aqua' : 'neutral'}
                            onClick={() => {
                                restoreEntry(entry.id);
                            }}
                        >
                            {entry.seed} · {entry.nodes}
                        </Button>
                    ))}
                </Stack>
            )}
        </ControlField>
    );
}

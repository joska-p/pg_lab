import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Stack } from '@repo/ui/components/Stack';

import { useCurrentId, useHistory } from '../../stores/lab/historyStore';
import { restoreEntry } from '../../stores/lab/labStore';

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

import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Text } from '@repo/ui/components/Text';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { restoreEntry, useCurrentId, useHistory } from '../../stores/lab/labStore';

const styles = stylex.create({
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    entry: {
        justifyContent: 'flex-start',
    },
});

/** Walks back through past candidates. Toy's history, always visible under the transport. */
export function HistorySection() {
    const history = useHistory();
    const currentId = useCurrentId();

    return (
        <ControlField label="History">
            {history.length === 0 ? (
                <Text variant="muted">No image yet</Text>
            ) : (
                <div {...stylex.props(styles.list)}>
                    {history.map((entry) => (
                        <Button
                            key={entry.id}
                            color={entry.id === currentId ? 'aqua' : 'neutral'}
                            style={styles.entry}
                            onClick={() => {
                                restoreEntry(entry.id);
                            }}
                        >
                            Seed {entry.seed}
                        </Button>
                    ))}
                </div>
            )}
        </ControlField>
    );
}

import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Text } from '@repo/ui/components/Text';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { restoreEntry, useCurrentId, useHistory } from '../../stores/vmStore';

const styles = stylex.create({
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    entry: {
        justifyContent: 'space-between',
    },
    meta: {
        fontSize: typography.fontSizeXs,
        fontVariantNumeric: 'tabular-nums',
        opacity: 0.7,
    },
});

export function HistoryPanel() {
    const history = useHistory();
    const currentId = useCurrentId();

    return (
        <ControlSection title="history">
            {history.length === 0 ? (
                <Text variant="muted">No image yet</Text>
            ) : (
                <div {...stylex.props(styles.list)}>
                    {history.map((entry) => (
                        <Button
                            key={entry.id}
                            color={entry.id === currentId ? 'aqua' : 'neutral'}
                            style={styles.entry}
                            title={`seed ${entry.seed} · ${entry.nodes} nodes`}
                            onClick={() => {
                                restoreEntry(entry.id);
                            }}
                        >
                            <span>Seed {entry.seed}</span>
                            <span {...stylex.props(styles.meta)}>{entry.nodes} nodes</span>
                        </Button>
                    ))}
                </div>
            )}
        </ControlSection>
    );
}

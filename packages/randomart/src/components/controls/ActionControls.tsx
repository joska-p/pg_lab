import { Button } from '@repo/ui/components/Button';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { setSeedText } from '../../stores/randomart/actions';
import { DownloadButton } from './DownloadButton';
import { StateIOButtons } from './StateIOButtons';

const styles = stylex.create({
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: space['2'],
    },
});

function ActionControls() {
    return (
        <div {...stylex.props(styles.grid)}>
            <Button
                onClick={() => {
                    setSeedText(Math.random().toString(36).slice(2, 10));
                }}
            >
                Rand
            </Button>
            <DownloadButton />
            <StateIOButtons />
        </div>
    );
}

export { ActionControls };

import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import * as stylex from '@stylexjs/stylex';

import { clearGrid, randomizeGrid, setToolMode } from '../../stores/automa/actions';
import { useBrushMode } from '../../stores/automa/selectors';

const styles = stylex.create({
    actions: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
    },
});

export function EditSection() {
    const brushMode = useBrushMode();

    return (
        <ControlSection title="Edit">
            <div {...stylex.props(styles.actions)}>
                <Button color="purple" onClick={randomizeGrid}>
                    Randomize
                </Button>
                <Button color="error" onClick={clearGrid}>
                    Clear
                </Button>
                <Button
                    color={brushMode === 'draw' ? 'solder' : undefined}
                    onClick={() => setToolMode('draw')}
                >
                    Draw
                </Button>
                <Button
                    color={brushMode === 'erase' ? 'error' : undefined}
                    onClick={() => setToolMode('erase')}
                >
                    Erase
                </Button>
            </div>
        </ControlSection>
    );
}

import { Button } from '@repo/ui/components/Button';
import { palette, radius, space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

const border = `light-dark(${palette.light2}, ${palette.dark2})`;

const styles = stylex.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: space['1'],
        border: `1px solid ${border}`,
        borderRadius: radius.lg,
        padding: space['1'],
    },
});

interface CompareToggleProps {
    mode: 'grid' | 'compare';
    onChange: (mode: 'grid' | 'compare') => void;
}

function CompareToggle({ mode, onChange }: CompareToggleProps) {
    return (
        <div {...stylex.props(styles.container)} role="tablist">
            <Button
                onClick={() => {
                    onChange('grid');
                }}
                role="tab"
                aria-selected={mode === 'grid'}
            >
                Grid View
            </Button>
            <Button
                onClick={() => {
                    onChange('compare');
                }}
                role="tab"
                aria-selected={mode === 'compare'}
            >
                Compare
            </Button>
        </div>
    );
}

export { CompareToggle };

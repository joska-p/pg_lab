import { palette, radius, space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

const muted = `light-dark(${palette.gray244}, ${palette.dark3})`;
const border = `light-dark(${palette.light2}, ${palette.dark2})`;

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: space['2'],
        border: `1px dashed ${border}`,
        borderRadius: radius.lg,
        paddingBlock: space['8'],
        paddingInline: space['4'],
        textAlign: 'center',
    },
    message: {
        fontSize: typography.fontSizeSm,
        color: muted,
    },
});

interface EmptyStateProps {
    message: string;
    icon?: ReactNode;
}

function EmptyState({ message, icon }: EmptyStateProps) {
    return (
        <div {...stylex.props(styles.base)}>
            {icon}
            <p {...stylex.props(styles.message)}>{message}</p>
        </div>
    );
}

export { EmptyState };

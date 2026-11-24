import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
    icon: {
        width: space['4'],
        height: space['4'],
    },
});

interface CloseIconProps {
    style?: stylex.StyleXStyles;
}

function CloseIcon({ style }: CloseIconProps) {
    return (
        <svg
            {...stylex.props(styles.icon, style)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

export { CloseIcon };

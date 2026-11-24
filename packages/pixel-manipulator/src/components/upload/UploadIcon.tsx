import { palette, space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

const muted = `light-dark(${palette.gray244}, ${palette.dark3})`;

const styles = stylex.create({
    icon: {
        width: space['8'],
        height: space['8'],
        color: muted,
        marginBottom: space['3'],
        marginInline: 'auto',
    },
});

function UploadIcon() {
    return (
        <svg
            {...stylex.props(styles.icon)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    );
}

export { UploadIcon };

import { palette } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

const muted = `light-dark(${palette.gray244}, ${palette.dark3})`;

const styles = stylex.create({
    svg: {
        color: muted,
    },
});

function WorkEmptyStateSvg() {
    return (
        <svg
            {...stylex.props(styles.svg)}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M12 12 4.93 4.93" />
            <path d="M12 12 2 12" />
            <path d="M12 12 12 22" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    );
}

export { WorkEmptyStateSvg };

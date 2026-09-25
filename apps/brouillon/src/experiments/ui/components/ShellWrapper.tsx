import * as stylex from '@stylexjs/stylex';

import { space, gruvboxPalette as palette, typography } from '../const.stylex';
import { surface } from '../styles.stylex';

const styles = stylex.create({
    base: {
        width: '100%',
        minHeight: '100dvh',
        height: '100dvh',
        backgroundColor: surface.bg,
        backgroundImage: `
      radial-gradient(45% 35% at 4% 6%, color-mix(in oklab, ${palette.brightRed} 30%, transparent), transparent 70%),
      radial-gradient(40% 35% at 96% 8%, color-mix(in oklab, ${palette.brightOrange} 28%, transparent), transparent 70%),
      radial-gradient(50% 40% at 88% 88%, color-mix(in oklab, ${palette.brightYellow} 26%, transparent), transparent 70%),
      radial-gradient(45% 45% at 8% 92%, color-mix(in oklab, ${palette.brightGreen} 28%, transparent), transparent 70%),
      radial-gradient(55% 40% at 50% 0%, color-mix(in oklab, ${palette.brightAqua} 24%, transparent), transparent 70%),
      radial-gradient(50% 50% at 100% 55%, color-mix(in oklab, ${palette.brightBlue} 30%, transparent), transparent 70%),
      radial-gradient(45% 40% at 0% 50%, color-mix(in oklab, ${palette.brightPurple} 28%, transparent), transparent 70%),
      radial-gradient(35% 30% at 50% 55%, color-mix(in oklab, ${palette.neutralYellow} 20%, transparent), transparent 70%),
      linear-gradient(160deg, color-mix(in oklab, ${palette.gray244} 20%, transparent), transparent 65%)
    `,
        color: surface.fg,
        fontFamily: typography.fontFamilySans,
        padding: space['0'],
        boxSizing: 'border-box',
        '@media (min-width: 1024px)': {
            padding: space['4'],
        },
    },
});

interface ShellWrapperProps {
    children?: React.ReactNode;
}

export function ShellWrapper({ children }: ShellWrapperProps) {
    return <div {...stylex.props(styles.base)}>{children}</div>;
}

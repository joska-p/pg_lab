import * as stylex from '@stylexjs/stylex';

import { colors } from '../../tokens/tint.stylex';
import type { ColorNames } from '../../tokens/tint.stylex';
import { generateAtlasPaths } from './generateAtlasPaths';

const animation = stylex.keyframes({
    '0%': { strokeDashoffset: '100%' },
    '100%': { strokeDashoffset: '-100%' },
});

const styles = stylex.create({
    base: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
});

const openStyle = stylex.create({
    path: {
        animationName: animation,
        animationDuration: '20s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    },
});

const closedStyle = stylex.create({
    path: {
        animationName: animation,
        animationDuration: '15s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDirection: 'reverse',
    },
});

interface AtlasPathsProps extends React.ComponentProps<'svg'> {
    seed?: number;
    color?: ColorNames;
}

export function AtlasPaths({ seed = 42, color = 'amber' }: AtlasPathsProps) {
    const paths = generateAtlasPaths(seed);

    const pathColor = colors[color];

    return (
        <svg viewBox="0 0 300 300" preserveAspectRatio="none" {...stylex.props(styles.base)}>
            <path
                d={paths.openPaths}
                fill="none"
                stroke={pathColor}
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: `${paths.openPathsLength} ${paths.openPathsLength}` }}
                {...stylex.props(openStyle.path)}
            />
            <path
                d={paths.closedPaths}
                fill="none"
                stroke={pathColor}
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: `${paths.closedPathsLength} ${paths.closedPathsLength}` }}
                {...stylex.props(closedStyle.path)}
            />
            {paths.dots.map((dot, i) => (
                <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={pathColor} />
            ))}
        </svg>
    );
}

import * as stylex from '@stylexjs/stylex';

import { colors } from '../../tokens/tint.stylex';
import type { ColorNames } from '../../tokens/tint.stylex';
import { generateAtlasPaths } from './generateAtlasPaths';

const styles = stylex.create({
    base: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
});

const animation = stylex.keyframes({
    '0%': { strokeDashoffset: '0' },
    '100%': { strokeDashoffset: '-200' },
});

const openStyle = stylex.create({
    path: {
        animationName: animation,
        animationDuration: '60s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    },
});

const closedStyle = stylex.create({
    path: {
        animationName: animation,
        animationDuration: '60s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDirection: 'reverse', // sens inverse, sans saut cette fois
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
            {paths.openPaths.map((d, i) => (
                <path
                    key={`o${i}`}
                    d={d}
                    pathLength={100}
                    strokeDasharray="100 100"
                    fill="none"
                    stroke={pathColor}
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...stylex.props(openStyle.path)}
                />
            ))}
            {paths.closedPaths.map((d, i) => (
                <path
                    key={`c${i}`}
                    d={d}
                    pathLength={100}
                    strokeDasharray="100 100"
                    fill="none"
                    stroke={pathColor}
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...stylex.props(closedStyle.path)}
                />
            ))}
            {paths.dots.map((dot, i) => (
                <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={pathColor} />
            ))}
        </svg>
    );
}

import * as stylex from '@stylexjs/stylex';
import type { ComponentProps, Ref } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { colors } from '../../tokens/tint.stylex';
import type { CardGraphic } from './types';

const styles = stylex.create({
    base: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
    },
});

const snakeMove = stylex.keyframes({
    '0%': { strokeDashoffset: '0' },
    '100%': { strokeDashoffset: '-1100' },
});

const twinkle = stylex.keyframes({
    '0%': { opacity: 0.35 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.35 },
});

const ringFade = stylex.keyframes({
    '0%': { opacity: 0.35 },
    '100%': { opacity: 0.9 },
});

const sweep = stylex.keyframes({
    '100%': { transform: 'rotate(360deg)' },
});

const bump = stylex.keyframes({
    '0%': { transform: 'scaleY(0.85)' },
    '100%': { transform: 'scaleY(1)' },
});

const blink = stylex.keyframes({
    '0%': { opacity: 0.35 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.35 },
});

const animStyles = stylex.create({
    snakePath: {
        strokeDasharray: '1000 10',
        animationName: snakeMove,
        animationDuration: '60s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    weavePath: {
        strokeDasharray: '420 18',
        animationName: snakeMove,
        animationDuration: '80s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    orbitDash: {
        strokeDasharray: '6 8',
        animationName: snakeMove,
        animationDuration: '90s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    constellationLine: {
        strokeDasharray: '80 6',
        animationName: snakeMove,
        animationDuration: '120s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    latticeLine: {
        strokeDasharray: '40 4',
        animationName: snakeMove,
        animationDuration: '100s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    twinkle: {
        animationName: twinkle,
        animationDuration: '3.2s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    contourRing: {
        animationName: ringFade,
        animationDuration: '4s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    radarSweep: {
        animationName: sweep,
        animationDuration: '6s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    specBar: {
        animationName: bump,
        animationDuration: '2.4s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
    blip: {
        animationName: blink,
        animationDuration: '2.6s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        '@media (prefers-reduced-motion: reduce)': {
            animationName: 'none',
        },
    },
});

type AnimClass = keyof typeof animationStyleMap;

const animationStyleMap = {
    'snake-path': animStyles.snakePath,
    'weave-path': animStyles.weavePath,
    'orbit-dash': animStyles.orbitDash,
    'constellation-line': animStyles.constellationLine,
    'lattice-line': animStyles.latticeLine,
    twinkle: animStyles.twinkle,
    'contour-ring': animStyles.contourRing,
    'radar-sweep': animStyles.radarSweep,
    'spec-bar': animStyles.specBar,
    blip: animStyles.blip,
} as const;

function isAnimClass(name: string): name is AnimClass {
    return Object.hasOwn(animationStyleMap, name);
}

function getAnimProps(name?: string) {
    if (!name || !isAnimClass(name)) {
        return null;
    }
    return stylex.props(animationStyleMap[name]);
}

function round(value: number): number {
    return Math.round(value * 10) / 10;
}

export interface VisualSvgProps extends ComponentProps<'svg'> {
    graphic: CardGraphic;
    color?: ColorNames;
    svgRef?: Ref<SVGSVGElement>;
}

export function VisualSvg({
    graphic,
    color = 'amber',
    svgRef,
    style,
    ...restProps
}: VisualSvgProps) {
    const pathColor = colors[color];

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 300 300"
            preserveAspectRatio="none"
            aria-hidden="true"
            {...stylex.props(styles.base)}
            style={{ color: pathColor, ...style }}
            {...restProps}
        >
            {graphic.rects.map((rect, i) => {
                const anim = getAnimProps(rect.className);
                return (
                    <rect
                        key={`r-${i}`}
                        x={round(rect.x)}
                        y={round(rect.y)}
                        width={round(rect.width)}
                        height={round(rect.height)}
                        rx={rect.rx}
                        fill={rect.fill ?? 'currentColor'}
                        fillOpacity={rect.fillOpacity}
                        opacity={rect.opacity}
                        className={anim?.className}
                        style={{ ...anim?.style, ...rect.style }}
                    />
                );
            })}
            {graphic.lines.map((line, i) => {
                const anim = getAnimProps(line.className);
                return (
                    <line
                        key={`l-${i}`}
                        x1={round(line.x1)}
                        y1={round(line.y1)}
                        x2={round(line.x2)}
                        y2={round(line.y2)}
                        stroke="currentColor"
                        strokeWidth={line.strokeWidth != null ? round(line.strokeWidth) : 0.4}
                        opacity={line.opacity}
                        className={anim?.className}
                        style={{ ...anim?.style, ...line.style }}
                    />
                );
            })}
            {graphic.ellipses.map((el, i) => {
                const anim = getAnimProps(el.className);
                return (
                    <ellipse
                        key={`e-${i}`}
                        cx={round(el.cx)}
                        cy={round(el.cy)}
                        rx={round(el.rx)}
                        ry={round(el.ry)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={el.strokeWidth != null ? round(el.strokeWidth) : 0.6}
                        strokeDasharray={el.strokeDasharray}
                        opacity={el.opacity}
                        transform={
                            el.rotate != null
                                ? `rotate(${round(el.rotate)} ${round(el.cx)} ${round(el.cy)})`
                                : undefined
                        }
                        className={anim?.className}
                        style={{ ...anim?.style, ...el.style }}
                    />
                );
            })}
            {graphic.paths.map((path, i) => {
                const anim = getAnimProps(path.className);
                return (
                    <path
                        key={`p-${i}`}
                        d={path.d}
                        fill={path.fill ?? 'none'}
                        fillOpacity={path.fillOpacity}
                        stroke={path.stroke ?? 'currentColor'}
                        strokeWidth={path.strokeWidth != null ? round(path.strokeWidth) : 0.6}
                        strokeOpacity={path.strokeOpacity}
                        strokeLinecap={path.strokeLinecap ?? 'round'}
                        strokeLinejoin={path.strokeLinejoin ?? 'round'}
                        strokeDasharray={path.strokeDasharray}
                        className={anim?.className}
                        style={{ ...anim?.style, ...path.style }}
                    />
                );
            })}
            {graphic.circles.map((c, i) => {
                const anim = getAnimProps(c.className);
                const delayStyle =
                    c.className === 'twinkle' && !c.style
                        ? { animationDelay: `${(i % 7) * 0.35}s` }
                        : c.style;
                return (
                    <circle
                        key={`c-${i}`}
                        cx={round(c.cx)}
                        cy={round(c.cy)}
                        r={round(c.r)}
                        fill={c.fill ?? 'currentColor'}
                        fillOpacity={c.fillOpacity}
                        stroke={c.stroke}
                        strokeWidth={c.strokeWidth}
                        opacity={c.opacity}
                        className={anim?.className}
                        style={{ ...anim?.style, ...delayStyle }}
                    />
                );
            })}
        </svg>
    );
}
